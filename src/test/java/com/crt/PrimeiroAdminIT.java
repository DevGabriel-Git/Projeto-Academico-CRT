package com.crt;

import static org.assertj.core.api.Assertions.*;

import com.crt.dto.RegisterRequest;
import com.crt.entity.Perfil;
import com.crt.entity.Usuario;
import com.crt.repository.UsuarioRepository;
import com.crt.service.PrimeiroAdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PrimeiroAdminIT {
    @Autowired PrimeiroAdminService service;
    @Autowired UsuarioRepository usuarios;
    @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
    @Autowired org.springframework.security.crypto.password.PasswordEncoder encoder;
    @Autowired org.springframework.context.ApplicationContext context;
    private final String senha = java.util.UUID.randomUUID().toString();

    @BeforeEach
    void bancoIsoladoNaTransacaoDeTeste() {
        for (String tabela :
                java.util.List.of(
                        "historico_carteira", "carteira", "acao", "corretora", "usuarios")) {
            jdbc.update("DELETE FROM " + tabela);
        }
    }

    @Test
    void criaPrimeiroAdminComHashSemResetarEmNovaExecucao() {
        var request = configuracao();
        service.inicializar(request);
        var admin = usuarios.findByEmail(request.getEmail()).orElseThrow();
        assertThat(admin.getPerfil()).isEqualTo(Perfil.ADMIN);
        assertThat(admin.getSenha()).isNotEqualTo(senha);
        assertThat(encoder.matches(senha, admin.getSenha())).isTrue();
        var hashOriginal = admin.getSenha();
        request.setSenha(java.util.UUID.randomUUID().toString());
        service.inicializar(request);
        assertThat(usuarios.count()).isEqualTo(1);
        assertThat(usuarios.findById(admin.getId()).orElseThrow().getSenha())
                .isEqualTo(hashOriginal);
    }

    @Test
    void naoPromoveUsuarioExistente() {
        var request = configuracao();
        usuarios.save(
                Usuario.builder()
                        .nome(request.getNome())
                        .email(request.getEmail())
                        .cpf(request.getCpf())
                        .senha(encoder.encode(senha))
                        .build());
        assertThatThrownBy(() -> service.inicializar(request))
                .isInstanceOf(IllegalStateException.class);
        assertThat(usuarios.findByEmail(request.getEmail()).orElseThrow().getPerfil())
                .isEqualTo(Perfil.USER);
    }

    @Test
    void naoCriaSegundoAdminNemContaComCpfDuplicado() {
        service.inicializar(configuracao());
        var outro = configuracao();
        outro.setEmail("outro-admin@example.invalid");
        outro.setCpf("10000000006");
        assertThatThrownBy(() -> service.inicializar(outro))
                .isInstanceOf(IllegalStateException.class);
        assertThat(usuarios.count()).isEqualTo(1);
    }

    @Test
    void rejeitaCpfJaCadastradoSemPromoverConta() {
        var request = configuracao();
        usuarios.save(
                Usuario.builder()
                        .nome("Titular")
                        .email("titular@example.invalid")
                        .cpf(request.getCpf())
                        .senha(encoder.encode(senha))
                        .build());
        assertThatThrownBy(() -> service.inicializar(request))
                .isInstanceOf(IllegalStateException.class);
        assertThat(usuarios.existsByPerfil(Perfil.ADMIN)).isFalse();
    }

    @Test
    void rejeitaSegredoAusenteCurtoOuMaiorQueLimiteBcryptSemExporValor() {
        for (String password : new String[] {null, "curta", "á".repeat(40)}) {
            var request = configuracao();
            request.setSenha(password);
            assertThatThrownBy(() -> service.inicializar(request))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessage("Configuracao do primeiro admin invalida; verifique o ambiente.");
        }
        assertThat(usuarios.count()).isZero();
    }

    @Test
    void bootstrapNaoExecutaSemProfileExplicito() {
        assertThat(context.getBeansOfType(com.crt.config.AdminBootstrap.class)).isEmpty();
    }

    @Test
    void adminExistenteNaoAceitaIdentidadeDiferenteNoBootstrap() {
        service.inicializar(configuracao());
        var conflito = configuracao();
        conflito.setCpf("10000000006");
        assertThatThrownBy(() -> service.inicializar(conflito))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Bootstrap admin em conflito; nenhuma conta foi alterada.");
        assertThat(usuarios.count()).isEqualTo(1);
    }

    private RegisterRequest configuracao() {
        return RegisterRequest.builder()
                .nome("Administrador")
                .email("bootstrap@example.invalid")
                .cpf("10000000005")
                .senha(senha)
                .build();
    }
}
