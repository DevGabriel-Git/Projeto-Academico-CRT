package com.crt;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.crt.entity.Usuario;
import com.crt.repository.UsuarioRepository;
import com.crt.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PerfisAcessoIT {
    @Autowired org.springframework.test.web.servlet.MockMvc mvc;
    @Autowired UsuarioRepository usuarios;
    @Autowired JwtService jwt;
    @Autowired org.springframework.security.crypto.password.PasswordEncoder encoder;

    @Test
    void cadastroPublicoNaoAceitaPerfilAdministrador() throws Exception {
        var password = java.util.UUID.randomUUID().toString();
        mvc.perform(
                        post("/auth/register")
                                .contentType("application/json")
                                .content(
                                        """
                {"nome":"Titular","email":"registro@example.invalid","cpf":"10000000001",
                "senha":"%s","perfil":"ADMIN"}
                """
                                                .formatted(password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil").value("USER"));
        assertThat(
                        encoder.matches(
                                password,
                                usuarios.findByEmail("registro@example.invalid")
                                        .orElseThrow()
                                        .getSenha()))
                .isTrue();
    }

    @Test
    void usuarioNaoAcessaAdministracao() throws Exception {
        var usuario = criarUsuario();
        mvc.perform(
                        get("/admin/usuarios")
                                .header(
                                        "Authorization",
                                        "Bearer " + jwt.generateToken(usuario.getEmail())))
                .andExpect(status().isForbidden());
        mvc.perform(get("/admin/usuarios")).andExpect(status().isUnauthorized());
    }

    @Test
    void consultaSessaoSomenteDoTitularAutenticado() throws Exception {
        var usuario = criarUsuario();
        mvc.perform(
                        get("/auth/me")
                                .header(
                                        "Authorization",
                                        "Bearer " + jwt.generateToken(usuario.getEmail())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(usuario.getId()))
                .andExpect(jsonPath("$.perfil").value("USER"))
                .andExpect(jsonPath("$.senha").doesNotExist())
                .andExpect(jsonPath("$.cpf").doesNotExist());
        mvc.perform(get("/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void loginPorEmailECpfRetornaPerfilDoBanco() throws Exception {
        var usuario = criarUsuario();
        for (String login : java.util.List.of(usuario.getEmail(), usuario.getCpf())) {
            mvc.perform(
                            post("/auth/login")
                                    .contentType("application/json")
                                    .content(
                                            """
                    {"login":"%s","senha":"%s"}
                    """
                                                    .formatted(login, senha)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.perfil").value("USER"))
                    .andExpect(jsonPath("$.token").isNotEmpty());
        }
    }

    private final String senha = java.util.UUID.randomUUID().toString();

    @Test
    void loginNovoNaoEImpedidoPorBearerAntigo() throws Exception {
        var usuario = criarUsuario();
        mvc.perform(
                        post("/auth/login")
                                .header("Authorization", "Bearer expirado")
                                .contentType("application/json")
                                .content(
                                        """
                {"login":"%s","senha":"%s"}
                """
                                                .formatted(usuario.getEmail(), senha)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil").value("USER"));
    }

    @Test
    void administradorConsultaUsuariosPaginadosSemSegredos() throws Exception {
        var admin = criarUsuario();
        admin.setPerfil(com.crt.entity.Perfil.ADMIN);
        usuarios.saveAndFlush(admin);
        var token = jwt.generateToken(admin.getEmail());
        mvc.perform(get("/admin/usuarios?page=0&size=1").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].id").isNumber())
                .andExpect(jsonPath("$.items[0].cpf").doesNotExist())
                .andExpect(jsonPath("$.items[0].senha").doesNotExist())
                .andExpect(jsonPath("$.items[0].token").doesNotExist())
                .andExpect(jsonPath("$.size").value(1));
        for (String pagination : java.util.List.of("page=-1", "size=0", "size=101", "page=abc")) {
            mvc.perform(
                            get("/admin/usuarios?" + pagination)
                                    .header("Authorization", "Bearer " + token))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    void permissaoAdministrativaERecarregadaDoBanco() throws Exception {
        var admin = criarUsuario();
        admin.setPerfil(com.crt.entity.Perfil.ADMIN);
        usuarios.saveAndFlush(admin);
        var token = jwt.generateToken(admin.getEmail());
        mvc.perform(get("/admin/usuarios").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        admin.setPerfil(com.crt.entity.Perfil.USER);
        usuarios.saveAndFlush(admin);
        mvc.perform(get("/admin/usuarios").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void administradorEntraPorEmailECpf() throws Exception {
        var admin = criarUsuario();
        admin.setPerfil(com.crt.entity.Perfil.ADMIN);
        usuarios.saveAndFlush(admin);
        for (String login : java.util.List.of(admin.getEmail(), admin.getCpf())) {
            mvc.perform(
                            post("/auth/login")
                                    .contentType("application/json")
                                    .content(
                                            """
                    {"login":"%s","senha":"%s"}
                    """
                                                    .formatted(login, senha)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.perfil").value("ADMIN"));
        }
    }

    private Usuario criarUsuario() {
        return usuarios.save(
                Usuario.builder()
                        .nome("Titular")
                        .email("perfis@example.invalid")
                        .cpf("10000000002")
                        .senha(encoder.encode(senha))
                        .build());
    }
}
