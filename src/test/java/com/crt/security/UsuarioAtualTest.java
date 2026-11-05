package com.crt.security;
import com.crt.entity.Usuario;
import org.junit.jupiter.api.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.*;
import java.util.List;
import static org.assertj.core.api.Assertions.*;
class UsuarioAtualTest {
    UsuarioAtual atual=new UsuarioAtual();
    @AfterEach void limpar(){ SecurityContextHolder.clearContext(); }
    @Test void rejeitaAusenciaDeAutenticacao(){
        assertThatThrownBy(atual::obter).isInstanceOf(AuthenticationCredentialsNotFoundException.class);
    }
    @Test void rejeitaPrincipalInvalido(){
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("user",null,List.of()));
        assertThatThrownBy(atual::obter).isInstanceOf(AuthenticationCredentialsNotFoundException.class);
    }
    @Test void rejeitaAutenticacaoNaoValidada(){
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(new Usuario(),null));
        assertThatThrownBy(atual::obter).isInstanceOf(AuthenticationCredentialsNotFoundException.class);
    }
    @Test void retornaUsuarioAutenticado(){
        var usuario=new Usuario();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(usuario,null,List.of()));
        assertThat(atual.obter()).isSameAs(usuario);
    }
}
