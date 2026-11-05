package com.crt.security;

import static org.assertj.core.api.Assertions.*;

import com.crt.entity.Usuario;
import java.util.List;
import org.junit.jupiter.api.*;
import org.springframework.security.authentication.*;
import org.springframework.security.core.context.SecurityContextHolder;

class UsuarioAtualTest {
    UsuarioAtual atual = new UsuarioAtual();

    @AfterEach
    void limpar() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void rejeitaAusenciaDeAutenticacao() {
        assertThatThrownBy(atual::obter)
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class);
    }

    @Test
    void rejeitaPrincipalInvalido() {
        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken("user", null, List.of()));
        assertThatThrownBy(atual::obter)
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class);
    }

    @Test
    void rejeitaAutenticacaoNaoValidada() {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(new Usuario(), null));
        assertThatThrownBy(atual::obter)
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class);
    }

    @Test
    void retornaUsuarioAutenticado() {
        var usuario = new Usuario();
        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(usuario, null, List.of()));
        assertThat(atual.obter()).isSameAs(usuario);
    }
}
