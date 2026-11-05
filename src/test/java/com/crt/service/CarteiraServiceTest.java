package com.crt.service;
import com.crt.dto.OperacaoDTO;
import com.crt.entity.*;
import com.crt.exception.RecursoNaoEncontradoException;
import com.crt.repository.*;
import com.crt.security.UsuarioAtual;
import org.junit.jupiter.api.*;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import java.math.BigDecimal;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
@ExtendWith(MockitoExtension.class)
class CarteiraServiceTest {
    @Mock CarteiraRepository carteiras;
    @Mock HistoricoCarteiraRepository historicos;
    @Mock CorretoraRepository corretoras;
    @Mock AcaoRepository acoes;
    @Mock UsuarioAtual atual;
    CarteiraService service;
    Usuario usuario;
    Corretora corretora;
    Acao acao;
    OperacaoDTO dto;
    @BeforeEach void preparar() {
        service = new CarteiraService(carteiras, historicos, corretoras, acoes, atual);
        usuario = Usuario.builder().id(7L).build();
        when(atual.obter()).thenReturn(usuario);
        corretora = new Corretora(); corretora.setId(1L);
        acao = new Acao(); acao.setId(2L); acao.setCorretora(corretora); acao.setCotacaoAtual(new BigDecimal("30.00"));
        dto = new OperacaoDTO(); dto.setCorretoraId(1L); dto.setAcaoId(2L); dto.setTipo("COMPRA"); dto.setQuantidade(10);
    }
    void recursos() {
        when(corretoras.findByIdAndUsuarioId(1L,7L)).thenReturn(Optional.of(corretora));
        when(acoes.findByIdAndUsuarioId(2L,7L)).thenReturn(Optional.of(acao));
    }
    Carteira posicao(int quantidade) {
        var c = new Carteira(); c.setQuantidade(quantidade); c.setPrecoMedio(new BigDecimal("10.00")); return c;
    }
    @Test void compraUsaCotacaoERegistraHistorico() {
        recursos(); var result = service.operar(dto);
        assertThat(result.getQuantidade()).isEqualTo(10);
        assertThat(result.getPrecoMedio()).isEqualByComparingTo("30.00");
        assertThat(result.getUsuario()).isSameAs(usuario);
        var captor = ArgumentCaptor.forClass(HistoricoCarteira.class);
        verify(historicos).save(captor.capture());
        assertThat(captor.getValue().getValorTotal()).isEqualByComparingTo("300.00");
        assertThat(captor.getValue().getTipo()).isEqualTo("COMPRA");
    }
    @Test void compraCalculaMediaPonderada() {
        recursos(); dto.setPrecoUnitario(new BigDecimal("20.00"));
        when(carteiras.findByCorretoraIdAndAcaoIdAndUsuarioId(1L,2L,7L)).thenReturn(Optional.of(posicao(10)));
        var result = service.operar(dto);
        assertThat(result.getQuantidade()).isEqualTo(20);
        assertThat(result.getPrecoMedio()).isEqualByComparingTo("15.00");
    }
    @Test void vendaSemPrecoUsaCotacaoPreservandoMedia() {
        recursos(); dto.setTipo("venda"); dto.setQuantidade(4);
        when(carteiras.findByCorretoraIdAndAcaoIdAndUsuarioId(1L,2L,7L)).thenReturn(Optional.of(posicao(10)));
        var result=service.operar(dto);
        assertThat(result.getQuantidade()).isEqualTo(6);
        assertThat(result.getPrecoMedio()).isEqualByComparingTo("10.00");
        var captor=ArgumentCaptor.forClass(HistoricoCarteira.class); verify(historicos).save(captor.capture());
        assertThat(captor.getValue().getValorTotal()).isEqualByComparingTo("120.00");
    }
    @Test void vendaInsuficienteNaoPersiste() {
        recursos(); dto.setTipo("VENDA");
        assertThatThrownBy(() -> service.operar(dto)).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(historicos); verify(carteiras, never()).save(any());
    }
    @Test void corretoraDeOutroUsuarioNaoPodeOperar() {
        assertThatThrownBy(() -> service.operar(dto)).isInstanceOf(RecursoNaoEncontradoException.class);
        verifyNoInteractions(acoes, carteiras, historicos);
    }
    @Test void acaoDeOutroUsuarioNaoPodeOperar() {
        when(corretoras.findByIdAndUsuarioId(1L,7L)).thenReturn(Optional.of(corretora));
        assertThatThrownBy(() -> service.operar(dto)).isInstanceOf(RecursoNaoEncontradoException.class);
        verifyNoInteractions(carteiras, historicos);
    }
    @Test void acaoDeOutraCorretoraNaoPodeOperar() {
        recursos(); var outra=new Corretora(); outra.setId(99L); acao.setCorretora(outra);
        assertThatThrownBy(() -> service.operar(dto)).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(carteiras,historicos);
    }
    @Test void precoInvalidoNaoPersiste() {
        recursos(); dto.setPrecoUnitario(BigDecimal.ZERO);
        assertThatThrownBy(() -> service.operar(dto)).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(historicos);
    }
    @Test void cotacaoAusenteNaoPersiste() {
        recursos(); acao.setCotacaoAtual(null);
        assertThatThrownBy(() -> service.operar(dto)).isInstanceOf(IllegalArgumentException.class);
    }
    @Test void tipoInvalidoNaoPersiste() {
        recursos(); dto.setTipo("TRANSFERENCIA");
        assertThatThrownBy(() -> service.operar(dto)).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(historicos);
    }
    @Test void consultasSaoIsoladasPorUsuario() {
        when(carteiras.findByIdAndUsuarioId(3L,7L)).thenReturn(Optional.of(posicao(10)));
        service.listar(); service.listarPorCorretora(1L); service.listarHistorico(3L);
        verify(carteiras).findByUsuarioId(7L);
        verify(carteiras).findByCorretoraIdAndUsuarioId(1L,7L);
        verify(historicos).findByCarteiraIdAndUsuarioId(3L,7L);
    }
    @Test void historicoDeOutraPessoaRetornaNaoEncontrado() {
        assertThatThrownBy(() -> service.listarHistorico(99L)).isInstanceOf(RecursoNaoEncontradoException.class);
        verifyNoInteractions(historicos);
    }
}
