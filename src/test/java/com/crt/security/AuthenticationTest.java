package com.crt.security;
import com.crt.entity.Usuario;
import com.crt.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.Optional;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
class AuthenticationTest {
    @Test void buscaPorEmailCpfOuRejeita(){
        var repo=mock(UsuarioRepository.class); var usuario=Usuario.builder().email("user@example.com").build();
        var service=new CustomUserDetailsService(repo);
        when(repo.findByEmail("user@example.com")).thenReturn(Optional.of(usuario));
        when(repo.findByCpf("123")).thenReturn(Optional.of(usuario));
        assertThat(service.loadUserByUsername("user@example.com")).isSameAs(usuario);
        assertThat(service.loadUserByUsername("123")).isSameAs(usuario);
        assertThatThrownBy(()->service.loadUserByUsername("missing")).isInstanceOf(org.springframework.security.core.userdetails.UsernameNotFoundException.class);
    }
    @Test void tokenTemExpiracaoEValidaTitular(){
        var service=new JwtService();
        byte[] key=new byte[32]; new java.security.SecureRandom().nextBytes(key);
        ReflectionTestUtils.setField(service,"secret",java.util.Base64.getEncoder().encodeToString(key));
        var token=service.generateToken("user@example.com");
        assertThat(service.extractUsername(token)).isEqualTo("user@example.com");
        assertThat(service.extractExpiration(token)).isAfter(new java.util.Date());
        assertThat(service.validateToken(token,Usuario.builder().email("user@example.com").build())).isTrue();
        assertThat(service.validateToken(token,Usuario.builder().email("other@example.com").build())).isFalse();
        assertThatThrownBy(()->service.extractUsername("invalid")).isInstanceOf(io.jsonwebtoken.JwtException.class);
    }
}
