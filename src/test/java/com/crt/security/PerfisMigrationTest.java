package com.crt.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

class PerfisMigrationTest {
    @Test
    void migracaoPreservaUsuarioExistenteComoUsuarioComum() throws Exception {
        var url = "jdbc:h2:mem:migracao-" + java.util.UUID.randomUUID() + ";DB_CLOSE_DELAY=-1";
        Flyway.configure().dataSource(url, "sa", "").target("1").load().migrate();
        try (var connection = java.sql.DriverManager.getConnection(url, "sa", "");
                var statement = connection.createStatement()) {
            statement.executeUpdate(
                    "INSERT INTO usuarios (id,nome,email,cpf,senha) VALUES (1,'Legado','legado@example.invalid','10000000007','hash-nao-utilizado')");
            Flyway.configure().dataSource(url, "sa", "").load().migrate();
            try (var rows = statement.executeQuery("SELECT perfil FROM usuarios WHERE id=1")) {
                assertThat(rows.next()).isTrue();
                assertThat(rows.getString(1)).isEqualTo("USER");
            }
            statement.execute("SHUTDOWN");
        }
    }
}
