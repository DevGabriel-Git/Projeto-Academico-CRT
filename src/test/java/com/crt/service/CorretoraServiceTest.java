package com.crt.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.crt.adapter.cep.CepService;
import com.crt.adapter.cnpj.CnpjService;
import com.crt.dto.*;
import com.crt.entity.*;
import com.crt.repository.CorretoraRepository;
import com.crt.security.UsuarioAtual;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.web.client.RestTemplate;

class CorretoraServiceTest {
    RestTemplate rest = mock(RestTemplate.class);
    CnpjService cnpj = mock(CnpjService.class);
    CepService cep = mock(CepService.class);
    CorretoraRepository repo = mock(CorretoraRepository.class);
    UsuarioAtual atual = mock(UsuarioAtual.class);
    CorretoraService service = new CorretoraService(rest, cnpj, cep, repo, atual);

    @BeforeEach
    void preparar() {
        when(atual.obter()).thenReturn(Usuario.builder().id(7L).build());
    }

    @Test
    void cadastraComEnderecoECvm() {
        var dados = new CnpjResponseDTO();
        dados.setCep("15700000");
        dados.setRazao_social("Corretora");
        var endereco = new CepResponseDTO();
        endereco.setLocalidade("Jales");
        when(cnpj.buscar("cnpj")).thenReturn(dados);
        when(cep.buscar("15700000")).thenReturn(endereco);
        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));
        var result = service.cadastrar("cnpj");
        assertThat(result.getCidade()).isEqualTo("Jales");
        assertThat(result.getValidadaNaCvm()).isTrue();
        assertThat(result.getUsuario().getId()).isEqualTo(7L);
    }

    @Test
    void cepECvmIndisponiveisNaoImpedemCadastro() {
        var dados = new CnpjResponseDTO();
        dados.setCep("15700000");
        when(cnpj.buscar("cnpj")).thenReturn(dados);
        when(cep.buscar(anyString())).thenThrow(new IllegalStateException());
        when(rest.getForObject(anyString(), eq(String.class)))
                .thenThrow(new IllegalStateException());
        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));
        assertThat(service.cadastrar("cnpj").getValidadaNaCvm()).isFalse();
    }

    @Test
    void cadastraSemCep() {
        when(cnpj.buscar("cnpj")).thenReturn(new CnpjResponseDTO());
        service.cadastrar("cnpj");
        verifyNoInteractions(cep);
    }

    @Test
    void cepVazioNaoConsultaEndereco() {
        var dados = new CnpjResponseDTO();
        dados.setCep("");
        when(cnpj.buscar("cnpj")).thenReturn(dados);
        service.cadastrar("cnpj");
        verifyNoInteractions(cep);
    }

    @Test
    void rejeitaDuplicadoEFalhaDeProvedor() {
        when(repo.findByCnpjAndUsuarioId("cnpj", 7L)).thenReturn(Optional.of(new Corretora()));
        assertThatThrownBy(() -> service.cadastrar("cnpj")).isInstanceOf(RuntimeException.class);
        when(cnpj.buscar("outro")).thenThrow(new IllegalStateException("indisponivel"));
        assertThatThrownBy(() -> service.cadastrar("outro")).isInstanceOf(RuntimeException.class);
        verify(repo, never()).save(any());
    }

    @Test
    void consultasEExclusao() {
        var corretora = new Corretora();
        when(repo.findByIdAndUsuarioId(1L, 7L)).thenReturn(Optional.of(corretora));
        when(repo.findByCnpjAndUsuarioId("cnpj", 7L)).thenReturn(Optional.of(corretora));
        assertThat(service.buscarPorCnpj("cnpj")).isSameAs(corretora);
        service.listar();
        service.deletar(1L);
        verify(repo).delete(corretora);
        verify(repo).findByUsuarioId(7L);
        assertThatThrownBy(() -> service.buscarPorId(99L)).isInstanceOf(RuntimeException.class);
        assertThatThrownBy(() -> service.buscarPorCnpj("ausente"))
                .isInstanceOf(RuntimeException.class);
    }
}
