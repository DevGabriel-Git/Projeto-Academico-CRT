package com.crt.service;

import com.crt.dto.AuthRequest;
import com.crt.dto.AuthResponse;
import com.crt.dto.RegisterRequest;
import com.crt.entity.Usuario;
import com.crt.repository.UsuarioRepository;
import com.crt.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class AuthService {
    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Dados de cadastro indisponiveis");
        }
        if (repository.findByCpf(request.getCpf()).isPresent()) {
            throw new IllegalArgumentException("Dados de cadastro indisponiveis");
        }
        Usuario user =
                Usuario.builder()
                        .nome(request.getNome())
                        .email(request.getEmail())
                        .cpf(request.getCpf())
                        .senha(passwordEncoder.encode(request.getSenha()))
                        .build();
        repository.save(user);
        String jwtToken = jwtService.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(jwtToken)
                .nome(user.getNome())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getLogin(), request.getSenha()));
        Usuario user =
                repository
                        .findByEmail(request.getLogin())
                        .orElseGet(() -> repository.findByCpf(request.getLogin()).orElseThrow());
        String jwtToken = jwtService.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(jwtToken)
                .nome(user.getNome())
                .email(user.getEmail())
                .build();
    }
}
