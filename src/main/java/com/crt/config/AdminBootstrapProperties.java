package com.crt.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** No generated toString or binding validation that could print a rejected secret. */
@Getter
@Setter
@ConfigurationProperties("app.bootstrap-admin")
public class AdminBootstrapProperties {
    private String nome;
    private String email;
    private String cpf;
    private String senha;
}
