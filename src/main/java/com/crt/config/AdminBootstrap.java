package com.crt.config;

import com.crt.dto.RegisterRequest;
import com.crt.service.PrimeiroAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("bootstrap-admin")
@EnableConfigurationProperties(AdminBootstrapProperties.class)
@RequiredArgsConstructor
public class AdminBootstrap implements ApplicationRunner {
    private final AdminBootstrapProperties properties;
    private final PrimeiroAdminService service;

    @Override
    public void run(ApplicationArguments args) {
        service.inicializar(
                RegisterRequest.builder()
                        .nome(properties.getNome())
                        .email(properties.getEmail())
                        .cpf(properties.getCpf())
                        .senha(properties.getSenha())
                        .build());
    }
}
