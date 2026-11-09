package com.crt.adapter.acao;

import com.crt.dto.AlphaVantageResponseDTO;
import com.crt.entity.Acao;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service("alphaVantageAcaoService")
@lombok.RequiredArgsConstructor
public class AlphaVantageService implements AcaoApi {
    private final RestTemplate rest;

    @Value("${alphavantage.key}")
    private String apiKey;

    @Override
    public Acao buscar(String ticker) {

        String url =
                "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol="
                        + ticker
                        + "&apikey="
                        + apiKey;
        AlphaVantageResponseDTO response = rest.getForObject(url, AlphaVantageResponseDTO.class);
        if (response == null
                || response.getGlobalQuote() == null
                || response.getGlobalQuote().getSymbol() == null
                || response.getGlobalQuote().getSymbol().isEmpty()) {
            throw new RuntimeException("Ticker não encontrado no Alpha Vantage: " + ticker);
        }
        Acao acao = new Acao();
        acao.setTicker(response.getGlobalQuote().getSymbol());
        acao.setNomeEmpresa(ticker);
        acao.setMoeda("USD");
        acao.setMercado("EUA");
        acao.setCotacaoAtual(new BigDecimal(response.getGlobalQuote().getPrice()));
        acao.setDataHoraCotacao(LocalDateTime.now());
        return acao;
    }
}
