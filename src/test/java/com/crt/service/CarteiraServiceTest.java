package com.crt.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.crt.dto.OperacaoDTO;
import com.crt.entity.*;
import com.crt.exception.RecursoNaoEncontradoException;
import com.crt.repository.*;
import com.crt.security.UsuarioAtual;
import java.math.BigDecimal;
import java.util.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

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

    @BeforeEach
    void preparar() {
        service = new CarteiraService(carteiras, historicos, corretoras, acoes, atual);
        usuario = Usuario.builder().id(7L).build();
        when(atual.obter()).thenReturn(usuario);
        corretora = new Corretora();
        corretora.setId(1L);
        acao = new Acao();
        acao.setId(2L);
        acao.setCorretora(corretora);
        acao.setCotacaoAtual(new BigDecimal("30.00"));
        dto = new OperacaoDTO();
        dto.setCorretoraId(1L);
        dto.setAcaoId(2L);
        dto.setTipo("COMPRA");
        dto.setQuantidade(10);
    }

    void recursos() {
        when(corretoras.findByIdAndUsuarioId(1L, 7L)).thenReturn(Optional.of(corretora));
        when(acoes.findByIdAndUsuarioId(2L, 7L)).thenReturn(Optional.of(acao));
    }

    Carteira posicao(int quantidade) {
        var c = new Carteira();
        c.setQuantidade(quantidade);
        c.setPrecoMedio(new BigDecimal("10.00"));
        return c;
    }

    @Test
    void compraUsaCotacaoERegistraHistorico() {
        recursos();
        var result = service.operar(dto);
        assertThat(result.getQuantidade()).isEqualTo(10);
        assertThat(result.getPrecoMedio()).isEqualByComparingTo("30.00");
        assertThat(result.getUsuario()).isSameAs(usuario);
        assertThat(result.getCorretora()).isSameAs(corretora);
        assertThat(result.getAcao()).isSameAs(acao);
        assertThat(result.getDataAtualizacao()).isNotNull();
        var captor = ArgumentCaptor.forClass(HistoricoCarteira.class);
        verify(historicos).save(captor.capture());
        assertThat(captor.getValue().getValorTotal()).isEqualByComparingTo("300.00");
        assertThat(captor.getValue().getTipo()).isEqualTo("COMPRA");
        assertThat(captor.getValue().getCarteira()).isSameAs(result);
        assertThat(captor.getValue().getUsuario()).isSameAs(usuario);
        assertThat(captor.getValue().getQuantidade()).isEqualTo(10);
        assertThat(captor.getValue().getPrecoUnitario()).isEqualByComparingTo("30.00");
        assertThat(captor.getValue().getDataOperacao()).isNotNull();
        assertThat(captor.getValue().getDataOperacao()).isEqualTo(result.getDataAtualizacao());
    }

    @Test
    void compraCalculaMediaPonderada() {
        recursos();
        dto.setPrecoUnitario(new BigDecimal("20.00"));
        when(carteiras.findByCorretoraIdAndAcaoIdAndUsuarioId(1L, 2L, 7L))
                .thenReturn(Optional.of(posicao(10)));
        var result = service.operar(dto);
        assertThat(result.getQuantidade()).isEqualTo(20);
        assertThat(result.getPrecoMedio()).isEqualByComparingTo("15.00");
    }

    @Test
    void vendaSemPrecoUsaCotacaoPreservandoMedia() {
        recursos();
        dto.setTipo("venda");
        dto.setQuantidade(4);
        when(carteiras.findByCorretoraIdAndAcaoIdAndUsuarioId(1L, 2L, 7L))
                .thenReturn(Optional.of(posicao(10)));
        var result = service.operar(dto);
        assertThat(result.getQuantidade()).isEqualTo(6);
        assertThat(result.getPrecoMedio()).isEqualByComparingTo("10.00");
        var captor = ArgumentCaptor.forClass(HistoricoCarteira.class);
        verify(historicos).save(captor.capture());
        assertThat(captor.getValue().getValorTotal()).isEqualByComparingTo("120.00");
    }

    @Test
    void vendaInsuficienteNaoPersiste() {
        recursos();
        dto.setTipo("VENDA");
        assertThatThrownBy(() -> service.operar(dto)).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(historicos);
        verify(carteiras, never()).save(any());
    }

    @Test
    void corretoraDeOutroUsuarioNaoPodeOperar() {
        assertThatThrownBy(() -> service.operar(dto))
                .isInstanceOf(RecursoNaoEncontradoException.class);
        verifyNoInteractions(acoes, carteiras, historicos);
    }

    @Test
    void acaoDeOutroUsuarioNaoPodeOperar() {
        when(corretoras.findByIdAndUsuarioId(1L, 7L)).thenReturn(Optional.of(corretora));
        assertThatThrownBy(() -> service.operar(dto))
                .isInstanceOf(RecursoNaoEncontradoException.class);
        verifyNoInteractions(carteiras, historicos);
    }

    @Test
    void acaoDeOutraCorretoraNaoPodeOperar() {
        recursos();
        var outra = new Corretora();
        outra.setId(99L);
        acao.setCorretora(outra);
        assertThatThrownBy(() -> service.operar(dto)).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(carteiras, historicos);
    }

    @Test
    void precoInvalidoNaoPersiste() {
        recursos();
        dto.setPrecoUnitario(BigDecimal.ZERO);
        assertThatThrownBy(() -> service.operar(dto)).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(historicos);
    }

    @Test
    void cotacaoAusenteNaoPersiste() {
        recursos();
        acao.setCotacaoAtual(null);
        assertThatThrownBy(() -> service.operar(dto)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void tipoInvalidoNaoPersiste() {
        recursos();
        dto.setTipo("TRANSFERENCIA");
        assertThatThrownBy(() -> service.operar(dto)).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(historicos);
    }

    @Test
    void consultasSaoIsoladasPorUsuario() {
        when(carteiras.findByIdAndUsuarioId(3L, 7L)).thenReturn(Optional.of(posicao(10)));
        var posicao = posicao(10);
        var evento = new HistoricoCarteira();
        when(carteiras.findByUsuarioId(7L)).thenReturn(List.of(posicao));
        when(carteiras.findByCorretoraIdAndUsuarioId(1L, 7L)).thenReturn(List.of(posicao));
        when(historicos.findByCarteiraIdAndUsuarioId(3L, 7L)).thenReturn(List.of(evento));
        assertThat(service.listar()).containsExactly(posicao);
        assertThat(service.listarPorCorretora(1L)).containsExactly(posicao);
        assertThat(service.listarHistorico(3L)).containsExactly(evento);
        assertThat(service.buscarPorId(3L).getQuantidade()).isEqualTo(10);
        verify(carteiras).findByUsuarioId(7L);
        verify(carteiras).findByCorretoraIdAndUsuarioId(1L, 7L);
        verify(historicos).findByCarteiraIdAndUsuarioId(3L, 7L);
    }

    @Test
    void historicoDeOutraPessoaRetornaNaoEncontrado() {
        assertThatThrownBy(() -> service.listarHistorico(99L))
                .isInstanceOf(RecursoNaoEncontradoException.class);
        verifyNoInteractions(historicos);
    }

    @Test
    void vendaDoSaldoExatoZeraPosicao() {
        recursos();
        dto.setTipo("VENDA");
        when(carteiras.findByCorretoraIdAndAcaoIdAndUsuarioId(1L, 2L, 7L))
                .thenReturn(Optional.of(posicao(10)));
        assertThat(service.operar(dto).getQuantidade()).isZero();
    }

    @Test
    void metricaSomenteAposCommit() {
        recursos();
        var registry = new io.micrometer.core.instrument.simple.SimpleMeterRegistry();
        io.micrometer.core.instrument.Metrics.addRegistry(registry);
        org.springframework.transaction.support.TransactionSynchronizationManager
                .initSynchronization();
        try {
            service.operar(dto);
            var counter = registry.counter("corretora.operacoes", "tipo", "COMPRA");
            assertThat(counter.count()).isZero();
            var hooks =
                    org.springframework.transaction.support.TransactionSynchronizationManager
                            .getSynchronizations();
            assertThat(hooks).hasSize(1);
            hooks.forEach(
                    org.springframework.transaction.support.TransactionSynchronization
                            ::afterCommit);
            assertThat(counter.count()).isEqualTo(1);
        } finally {
            org.springframework.transaction.support.TransactionSynchronizationManager
                    .clearSynchronization();
            io.micrometer.core.instrument.Metrics.removeRegistry(registry);
            registry.close();
        }
    }
}
