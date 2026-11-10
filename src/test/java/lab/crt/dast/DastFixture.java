package lab.crt.dast;

import com.crt.CorretoraAcademicoApplication;
import java.util.Arrays;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Test-only launcher, excluded from the application JAR and normal component scan. */
@Configuration(proxyBeanMethods = false)
public class DastFixture {
    private static final String DATABASE_ARGUMENT =
            "--spring.datasource.url=jdbc:h2:mem:crt-dast;DB_CLOSE_DELAY=-1";

    public static void main(String[] args) {
        verifyArguments(args);
        SpringApplication.run(
                new Class<?>[] {CorretoraAcademicoApplication.class, DastFixture.class}, args);
    }

    static void verifyArguments(String[] args) {
        var urls =
                Arrays.stream(args)
                        .filter(argument -> argument.startsWith("--spring.datasource.url="))
                        .toList();
        if (urls.size() != 1 || !urls.getFirst().equals(DATABASE_ARGUMENT)) {
            throw new IllegalArgumentException("Laboratorio exige seu banco H2 efemero exclusivo.");
        }
    }

    @Bean
    ApplicationRunner seed(JdbcTemplate jdbc, PasswordEncoder encoder, Environment environment) {
        return ignored -> {
            var password = environment.getRequiredProperty("LAB_PASSWORD");
            if (password.length() < 24) {
                throw new IllegalArgumentException("Laboratorio exige credencial aleatoria.");
            }
            seedUsers(jdbc, encoder.encode(password));
            seedPortfolio(jdbc, 100);
            seedPortfolio(jdbc, 200);
        };
    }

    private static void seedUsers(JdbcTemplate jdbc, String hash) {
        for (var id : new int[] {100, 200, 300}) {
            jdbc.update(
                    "INSERT INTO usuarios (id,nome,email,cpf,senha,perfil) VALUES (?,?,?,?,?,?)",
                    id,
                    "Laboratorio " + id,
                    "lab" + id + "@example.invalid",
                    "10000000" + id,
                    hash,
                    id == 300 ? "ADMIN" : "USER");
        }
    }

    private static void seedPortfolio(JdbcTemplate jdbc, int owner) {
        seedBrokerAndStock(jdbc, owner);
        seedPositionAndHistory(jdbc, owner);
    }

    private static void seedBrokerAndStock(JdbcTemplate jdbc, int owner) {
        int broker = owner * 10 + 1;
        int stock = owner * 10 + 2;
        jdbc.update(
                "INSERT INTO corretora (id,cnpj,nome_fantasia,usuario_id) VALUES (?,?,?,?)",
                broker,
                "00000000000" + owner,
                "Laboratorio " + owner,
                owner);
        jdbc.update(
                "INSERT INTO acao (id,ticker,mercado,moeda,cotacao_atual,corretora_id,usuario_id)"
                        + " VALUES (?,?, 'BR','BRL',30,?,?)",
                stock,
                "LAB" + owner,
                broker,
                owner);
    }

    private static void seedPositionAndHistory(JdbcTemplate jdbc, int owner) {
        int broker = owner * 10 + 1;
        int stock = owner * 10 + 2;
        int position = owner * 10 + 3;
        jdbc.update(
                "INSERT INTO carteira (id,corretora_id,acao_id,usuario_id,quantidade,preco_medio,version)"
                        + " VALUES (?,?,?,?,10,25,0)",
                position,
                broker,
                stock,
                owner);
        jdbc.update(
                "INSERT INTO historico_carteira (id,carteira_id,usuario_id,tipo,quantidade,preco_unitario,valor_total,data_operacao)"
                        + " VALUES (?,?,?,'COMPRA',10,25,250,CURRENT_TIMESTAMP)",
                owner * 10 + 4,
                position,
                owner);
    }
}
