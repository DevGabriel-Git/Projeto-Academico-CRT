package com.crt.security;

import com.crt.entity.Usuario;
import com.crt.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Usuario> byEmail = usuarioRepository.findByEmail(username);
        if (byEmail.isPresent()) {
            return byEmail.get();
        }
        Optional<Usuario> byCpf = usuarioRepository.findByCpf(username);
        if (byCpf.isPresent()) {
            return byCpf.get();
        }
        throw new UsernameNotFoundException("Usuário não encontrado com email ou cpf: " + username);
    }
}
