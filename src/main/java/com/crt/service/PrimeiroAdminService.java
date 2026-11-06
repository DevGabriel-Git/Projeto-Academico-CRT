package com.crt.service;

import com.crt.dto.RegisterRequest;
import com.crt.entity.Perfil;
import com.crt.entity.Usuario;
import com.crt.repository.UsuarioRepository;
import jakarta.validation.Validator;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PrimeiroAdminService {
    private static final int MAX_PASSWORD_BYTES = 72;
    private static final String BOOTSTRAP_CONFLICT =
            "Bootstrap admin em conflito; nenhuma conta foi alterada.";
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final Validator validator;

    @Transactional
    public void inicializar(RegisterRequest request) {
        validar(request);
        usuarios.bloquearInicializacaoAdmin();
        var existente = usuarios.findByEmail(request.getEmail());
        if (existente.isPresent() && existente.get().getPerfil() == Perfil.ADMIN) {
            validarIdentidade(existente.get(), request);
            return;
        }
        if (existente.isPresent()
                || usuarios.existsByPerfil(Perfil.ADMIN)
                || usuarios.findByCpf(request.getCpf()).isPresent()) {
            throw new IllegalStateException(BOOTSTRAP_CONFLICT);
        }
        usuarios.save(
                Usuario.builder()
                        .nome(request.getNome())
                        .email(request.getEmail())
                        .cpf(request.getCpf())
                        .senha(encoder.encode(request.getSenha()))
                        .perfil(Perfil.ADMIN)
                        .build());
    }

    private void validar(RegisterRequest request) {
        if (!validator.validate(request).isEmpty()
                || request.getSenha().getBytes(StandardCharsets.UTF_8).length
                        > MAX_PASSWORD_BYTES) {
            throw new IllegalStateException(
                    "Configuracao do primeiro admin invalida; verifique o ambiente.");
        }
    }

    private void validarIdentidade(Usuario existente, RegisterRequest request) {
        if (!existente.getCpf().equals(request.getCpf())) {
            throw new IllegalStateException(BOOTSTRAP_CONFLICT);
        }
    }
}
