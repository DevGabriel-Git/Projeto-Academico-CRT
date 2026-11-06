package com.crt.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.crt.config.AdminBootstrap;
import com.crt.config.AdminBootstrapProperties;
import com.crt.dto.RegisterRequest;
import com.crt.service.PrimeiroAdminService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class AdminBootstrapTest {
    @Test
    void encaminhaConfiguracaoSemImprimirSegredo() {
        var properties = new AdminBootstrapProperties();
        properties.setNome("Operador");
        properties.setEmail("operador@example.invalid");
        properties.setCpf("10000000005");
        var senha = java.util.UUID.randomUUID().toString();
        properties.setSenha(senha);
        var service = mock(PrimeiroAdminService.class);
        new AdminBootstrap(properties, service)
                .run(new org.springframework.boot.DefaultApplicationArguments());
        var request = ArgumentCaptor.forClass(RegisterRequest.class);
        verify(service).inicializar(request.capture());
        assertThat(request.getValue().getSenha()).isEqualTo(senha);
        assertThat(request.getValue().getEmail()).isEqualTo(properties.getEmail());
        assertThat(properties.toString()).doesNotContain(senha);
    }
}
