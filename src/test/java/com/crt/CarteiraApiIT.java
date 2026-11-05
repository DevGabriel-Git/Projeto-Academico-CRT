package com.crt;

import static org.assertj.core.api.Assertions.*;

import com.crt.entity.*;
import com.crt.repository.*;
import com.crt.security.JwtService;
import java.math.BigDecimal;
import java.net.http.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
@ActiveProfiles("test")
class CarteiraApiIT {
    @Autowired org.springframework.test.web.servlet.MockMvc mvc;
    @Autowired UsuarioRepository usuarios;
    @Autowired CorretoraRepository corretoras;
    @Autowired AcaoRepository acoes;
    @Autowired CarteiraRepository carteiras;

    @org.springframework.test.context.bean.override.mockito.MockitoSpyBean
    HistoricoCarteiraRepository historicos;

    @Autowired JwtService jwt;
    String token;
    String outroToken;
    Long corretoraId;
    Long acaoId;

    record Response(int statusCode, String body) {}

    @BeforeEach
    void preparar() {
        historicos.deleteAll();
        carteiras.deleteAll();
        acoes.deleteAll();
        corretoras.deleteAll();
        usuarios.deleteAll();
        var usuario =
                usuarios.save(
                        Usuario.builder()
                                .nome("Teste")
                                .email("teste@example.com")
                                .cpf("12345678901")
                                .senha("hash")
                                .build());
        var outro =
                usuarios.save(
                        Usuario.builder()
                                .nome("Outro")
                                .email("outro@example.com")
                                .cpf("12345678902")
                                .senha("hash")
                                .build());
        token = jwt.generateToken(usuario.getEmail());
        outroToken = jwt.generateToken(outro.getEmail());
        var corretora = new Corretora();
        corretora.setUsuario(usuario);
        corretora.setCnpj("12345678000190");
        corretora = corretoras.save(corretora);
        corretoraId = corretora.getId();
        var acao = new Acao();
        acao.setUsuario(usuario);
        acao.setCorretora(corretora);
        acao.setTicker("PETR4");
        acao.setMercado("BR");
        acao.setCotacaoAtual(new BigDecimal("30"));
        acao = acoes.save(acao);
        acaoId = acao.getId();
    }

    Response request(String path, String method, String body, String credential) throws Exception {
        var builder =
                org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request(
                                org.springframework.http.HttpMethod.valueOf(method), path)
                        .contentType("application/json");
        if (credential != null) builder.header("Authorization", "Bearer " + credential);
        if (body != null) builder.content(body);
        var result = mvc.perform(builder).andReturn().getResponse();
        return new Response(result.getStatus(), result.getContentAsString());
    }

    String operacao(String tipo, int quantidade) {
        return "{\"corretoraId\":"
                + corretoraId
                + ",\"acaoId\":"
                + acaoId
                + ",\"tipo\":\""
                + tipo
                + "\",\"quantidade\":"
                + quantidade
                + "}";
    }

    @Test
    void compraVendaEHistoricoAtomico() throws Exception {
        assertThat(request("/carteira/operar", "POST", operacao("COMPRA", 10), token).statusCode())
                .isEqualTo(200);
        var carteira =
                carteiras
                        .findByCorretoraIdAndUsuarioId(
                                corretoraId,
                                usuarios.findByEmail("teste@example.com").orElseThrow().getId())
                        .getFirst();
        assertThat(request("/carteira/operar", "POST", operacao("VENDA", 4), token).statusCode())
                .isEqualTo(200);
        assertThat(carteiras.findById(carteira.getId()).orElseThrow().getQuantidade()).isEqualTo(6);
        assertThat(historicos.count()).isEqualTo(2);
        assertThat(
                        request("/carteira/" + carteira.getId() + "/historico", "GET", null, token)
                                .body())
                .contains("COMPRA", "VENDA")
                .doesNotContain("senha", "cpf", "password");
    }

    @Test
    void impedeIdorEmOperacaoEConsultas() throws Exception {
        assertThat(
                        request("/carteira/operar", "POST", operacao("COMPRA", 10), outroToken)
                                .statusCode())
                .isEqualTo(404);
        assertThat(carteiras.count()).isZero();
        assertThat(historicos.count()).isZero();
        request("/carteira/operar", "POST", operacao("COMPRA", 10), token);
        var id = carteiras.findAll().getFirst().getId();
        assertThat(request("/carteira/" + id, "GET", null, outroToken).statusCode()).isEqualTo(404);
        assertThat(request("/carteira/" + id + "/historico", "GET", null, outroToken).statusCode())
                .isEqualTo(404);
        assertThat(request("/carteira/corretora/" + corretoraId, "GET", null, outroToken).body())
                .isEqualTo("[]");
        assertThat(request("/carteira", "GET", null, outroToken).body()).isEqualTo("[]");
    }

    @Test
    void validaEntradaESaldoSemPersistenciaParcial() throws Exception {
        for (int quantidade : new int[] {0, -1})
            assertThat(
                            request(
                                            "/carteira/operar",
                                            "POST",
                                            operacao("COMPRA", quantidade),
                                            token)
                                    .statusCode())
                    .isEqualTo(400);
        assertThat(request("/carteira/operar", "POST", operacao("INVALIDA", 1), token).statusCode())
                .isEqualTo(400);
        assertThat(request("/carteira/operar", "POST", "{}", token).statusCode()).isEqualTo(400);
        assertThat(request("/carteira/operar", "POST", operacao("VENDA", 1), token).statusCode())
                .isEqualTo(400);
        assertThat(carteiras.count()).isZero();
        assertThat(historicos.count()).isZero();
    }

    @Test
    void exigeTokenERejeitaTokenMalformado() throws Exception {
        assertThat(request("/carteira", "GET", null, null).statusCode()).isEqualTo(401);
        assertThat(request("/carteira", "GET", null, "invalido").statusCode()).isEqualTo(401);
        assertThat(request("/actuator/health", "GET", null, null).statusCode()).isEqualTo(200);
        assertThat(request("/actuator/env", "GET", null, token).statusCode()).isEqualTo(404);
    }

    @Test
    void consultaAcoesECorretorasDoUsuario() throws Exception {
        assertThat(request("/acoes", "GET", null, token).body()).contains("PETR4");
        assertThat(request("/acoes/" + acaoId, "GET", null, token).statusCode()).isEqualTo(200);
        assertThat(request("/acoes/ticker/PETR4", "GET", null, token).statusCode()).isEqualTo(200);
        assertThat(request("/corretoras", "GET", null, token).body()).contains("12345678000190");
        assertThat(request("/corretoras/" + corretoraId, "GET", null, token).statusCode())
                .isEqualTo(200);
        assertThat(request("/corretoras/cnpj/12345678000190", "GET", null, token).statusCode())
                .isEqualTo(200);
        assertThat(request("/acoes", "GET", null, outroToken).body()).isEqualTo("[]");
    }

    @Test
    void cadastroLoginEValidacao() throws Exception {
        var registration =
                "{\"nome\":\"Novo\",\"email\":\"novo@example.com\",\"cpf\":\"12345678903\",\"senha\":\"Senha-forte-123!\"}";
        assertThat(request("/auth/register", "POST", registration, null).statusCode())
                .isEqualTo(200);
        assertThat(
                        request(
                                        "/auth/login",
                                        "POST",
                                        "{\"login\":\"novo@example.com\",\"senha\":\"Senha-forte-123!\"}",
                                        null)
                                .statusCode())
                .isEqualTo(200);
        assertThat(
                        request(
                                        "/auth/login",
                                        "POST",
                                        "{\"login\":\"12345678903\",\"senha\":\"Senha-forte-123!\"}",
                                        null)
                                .statusCode())
                .isEqualTo(200);
        assertThat(
                        request(
                                        "/auth/login",
                                        "POST",
                                        "{\"login\":\"novo@example.com\",\"senha\":\"errada\"}",
                                        null)
                                .statusCode())
                .isEqualTo(401);
        assertThat(request("/auth/register", "POST", "{}", null).statusCode()).isEqualTo(400);
    }

    @Test
    void falhaNoHistoricoRevertePosicao() throws Exception {
        org.mockito.Mockito.doThrow(
                        new org.springframework.dao.DataIntegrityViolationException("simulated"))
                .when(historicos)
                .save(org.mockito.ArgumentMatchers.any(HistoricoCarteira.class));
        assertThat(request("/carteira/operar", "POST", operacao("COMPRA", 10), token).statusCode())
                .isEqualTo(500);
        assertThat(carteiras.count()).isZero();
        assertThat(historicos.count()).isZero();
    }

    @Test
    void versaoImpedeAtualizacaoPerdida() throws Exception {
        request("/carteira/operar", "POST", operacao("COMPRA", 10), token);
        var id = carteiras.findAll().getFirst().getId();
        var primeira = carteiras.findById(id).orElseThrow();
        var segunda = carteiras.findById(id).orElseThrow();
        primeira.setQuantidade(9);
        carteiras.saveAndFlush(primeira);
        segunda.setQuantidade(8);
        assertThatThrownBy(() -> carteiras.saveAndFlush(segunda))
                .isInstanceOf(
                        org.springframework.orm.ObjectOptimisticLockingFailureException.class);
        assertThat(carteiras.findById(id).orElseThrow().getQuantidade()).isEqualTo(9);
    }

    @Test
    void rejeitaPrecoComMaisDeDuasCasas() throws Exception {
        var json = operacao("COMPRA", 10).replace("}", ",\"precoUnitario\":0.001}");
        assertThat(request("/carteira/operar", "POST", json, token).statusCode()).isEqualTo(400);
        assertThat(carteiras.count()).isZero();
        assertThat(historicos.count()).isZero();
    }

    @Test
    void erroUsaProblemDetail() throws Exception {
        mvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                                        "/carteira/operar")
                                .header("Authorization", "Bearer " + token)
                                .contentType("application/json")
                                .content("{}"))
                .andExpect(
                        org.springframework.test.web.servlet.result.MockMvcResultMatchers.status()
                                .isBadRequest())
                .andExpect(
                        org.springframework.test.web.servlet.result.MockMvcResultMatchers.content()
                                .contentTypeCompatibleWith(
                                        org.springframework.http.MediaType
                                                .APPLICATION_PROBLEM_JSON));
    }

    @Test
    void requisicaoComCookieSemBearerMantemProtecaoCsrf() throws Exception {
        mvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(
                                        "/carteira/operar")
                                .cookie(new jakarta.servlet.http.Cookie("SESSION", "laboratorio"))
                                .contentType("application/json")
                                .content(operacao("COMPRA", 1)))
                .andExpect(
                        org.springframework.test.web.servlet.result.MockMvcResultMatchers.status()
                                .isForbidden());
        assertThat(carteiras.count()).isZero();
    }
}
