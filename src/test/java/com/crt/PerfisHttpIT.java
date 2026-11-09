package com.crt;

import static org.assertj.core.api.Assertions.assertThat;

import com.crt.entity.Perfil;
import com.crt.entity.Usuario;
import com.crt.repository.UsuarioRepository;
import com.crt.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
            "spring.datasource.url=jdbc:h2:mem:perfis-http;DB_CLOSE_DELAY=-1",
            "server.address=127.0.0.1"
        })
@ActiveProfiles("test")
class PerfisHttpIT {
    @Autowired UsuarioRepository usuarios;
    @Autowired JwtService jwt;
    @Autowired org.springframework.core.env.Environment environment;

    @Test
    void httpRealDistingueSemLoginSemPermissaoEAdministrador() throws Exception {
        var usuario =
                usuarios.save(
                        Usuario.builder()
                                .nome("Laboratorio")
                                .email("http@example.invalid")
                                .cpf("10000000010")
                                .senha("hash-nao-utilizado")
                                .build());
        try {
            assertThat(statusAdmin(null)).isEqualTo(401);
            var token = jwt.generateToken(usuario.getEmail());
            assertThat(statusAdmin(token)).isEqualTo(403);
            usuario.setPerfil(Perfil.ADMIN);
            usuarios.saveAndFlush(usuario);
            assertThat(statusAdmin(token)).isEqualTo(200);
        } finally {
            usuarios.deleteById(usuario.getId());
        }
    }

    private int statusAdmin(String token) throws Exception {
        var port = environment.getRequiredProperty("local.server.port");
        var connection =
                (java.net.HttpURLConnection)
                        java.net
                                .URI
                                .create("http://127.0.0.1:" + port + "/admin/usuarios")
                                .toURL()
                                .openConnection();
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);
        if (token != null) connection.setRequestProperty("Authorization", "Bearer " + token);
        try {
            return connection.getResponseCode();
        } finally {
            connection.disconnect();
        }
    }
}
