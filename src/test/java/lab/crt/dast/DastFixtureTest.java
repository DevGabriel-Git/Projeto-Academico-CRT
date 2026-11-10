package lab.crt.dast;

import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;

class DastFixtureTest {
    @Test
    void aceitaSomenteBancoEmMemoriaDoLaboratorio() {
        assertThatCode(
                        () ->
                                DastFixture.verifyArguments(
                                        new String[] {
                                            "--spring.datasource.url=jdbc:h2:mem:crt-dast;DB_CLOSE_DELAY=-1"
                                        }))
                .doesNotThrowAnyException();
    }

    @Test
    void recusaBancoRealArquivoTcpUrlDuplicadaOuAusenteAntesDeIniciarSpring() {
        for (var url :
                new String[] {
                    "jdbc:postgresql://localhost:5432/corretora",
                    "jdbc:h2:file:data/corretora-dev",
                    "jdbc:h2:tcp://database/mem:crt-dast",
                    "jdbc:h2:mem:outro"
                }) {
            assertThatThrownBy(
                            () ->
                                    DastFixture.verifyArguments(
                                            new String[] {"--spring.datasource.url=" + url}))
                    .isInstanceOf(IllegalArgumentException.class);
        }
        assertThatThrownBy(() -> DastFixture.verifyArguments(new String[0]))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(
                        () ->
                                DastFixture.verifyArguments(
                                        new String[] {
                                            "--spring.datasource.url=jdbc:h2:mem:crt-dast;DB_CLOSE_DELAY=-1",
                                            "--spring.datasource.url=jdbc:h2:mem:crt-dast;DB_CLOSE_DELAY=-1"
                                        }))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
