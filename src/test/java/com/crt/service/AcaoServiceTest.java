package com.crt.service;
import com.crt.adapter.acao.BrapiService;
import com.crt.entity.*;
import com.crt.repository.*;
import com.crt.security.UsuarioAtual;
import org.junit.jupiter.api.*;
import java.math.BigDecimal;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
class AcaoServiceTest {
    AcaoRepository repo=mock(AcaoRepository.class);
    BrapiService brapi=mock(BrapiService.class);
    CotacaoService cotacoes=mock(CotacaoService.class);
    CorretoraRepository corretoras=mock(CorretoraRepository.class);
    UsuarioAtual atual=mock(UsuarioAtual.class);
    AcaoService service=new AcaoService(repo,brapi,cotacoes,corretoras,atual);
    @BeforeEach void preparar(){when(atual.obter()).thenReturn(Usuario.builder().id(7L).build());}
    @Test void cadastraComProvedorEUsuario(){
        var corretora=new Corretora(); var acao=new Acao();
        when(corretoras.findByCnpjAndUsuarioId("cnpj",7L)).thenReturn(Optional.of(corretora));
        when(cotacoes.buscar("BR","PETR4")).thenReturn(acao);
        when(repo.save(acao)).thenReturn(acao);
        assertThat(service.cadastrar("PETR4","BR","cnpj")).isSameAs(acao);
        assertThat(acao.getUsuario().getId()).isEqualTo(7L); assertThat(acao.getCorretora()).isSameAs(corretora);
    }
    @Test void rejeitaDuplicadoECorretoraAusente(){
        when(repo.findByTickerAndUsuarioId("PETR4",7L)).thenReturn(Optional.of(new Acao()));
        assertThatThrownBy(()->service.cadastrar("PETR4","BR","cnpj")).isInstanceOf(RuntimeException.class);
        assertThatThrownBy(()->service.cadastrar("VALE3","BR","cnpj")).isInstanceOf(RuntimeException.class);
        verifyNoInteractions(cotacoes);
    }
    @Test void consultasEAtualizacao(){
        var acao=new Acao(); acao.setMercado("BR"); acao.setTicker("PETR4");
        var cotacao=new Acao(); cotacao.setCotacaoAtual(new BigDecimal("42.00"));
        when(repo.findByIdAndUsuarioId(1L,7L)).thenReturn(Optional.of(acao));
        when(repo.findByTickerAndUsuarioId("PETR4",7L)).thenReturn(Optional.of(acao));
        when(cotacoes.buscar("BR","PETR4")).thenReturn(cotacao);
        assertThat(service.buscarPorTicker("PETR4")).isSameAs(acao);
        service.listar(); service.atualizarCotacao(1L);
        assertThat(acao.getCotacaoAtual()).isEqualByComparingTo("42.00");
        assertThat(acao.getDataHoraCotacao()).isNotNull(); verify(repo).findByUsuarioId(7L);
        assertThatThrownBy(()->service.buscarPorId(99L)).isInstanceOf(RuntimeException.class);
        assertThatThrownBy(()->service.buscarPorTicker("INVALIDO")).isInstanceOf(RuntimeException.class);
    }
    @Test void listaDisponiveisDeAmbosMercados(){
        when(brapi.listarDisponiveis()).thenReturn(List.of("PETR4"));
        assertThat(service.listarDisponiveis()).hasSize(9);
    }
}
