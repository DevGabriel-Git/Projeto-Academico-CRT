package com.crt.adapter.acao;

import com.crt.dto.BrapiResponseDTO;
import com.crt.entity.Acao;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.List;

@Service("brapiAcaoService")
public class BrapiService implements AcaoApi {

    @Value("${brapi.token}")
    private String token;

    private List<String> cacheAcoes;

    public static class BrapiListResponse {
        private List<Stock> stocks;
        public List<Stock> getStocks() { return stocks; }
        public void setStocks(List<Stock> stocks) { this.stocks = stocks; }

        public static class Stock {
            private String stock;
            public String getStock() { return stock; }
            public void setStock(String stock) { this.stock = stock; }
        }
    }

    public List<String> listarDisponiveis() {
        if (cacheAcoes != null) {
            return cacheAcoes;
        }
        RestTemplate rest = new RestTemplate();
        String url = "https://brapi.dev/api/quote/list?token=" + token;
        BrapiListResponse response = rest.getForObject(url, BrapiListResponse.class);
        
        if (response != null && response.getStocks() != null) {
            cacheAcoes = response.getStocks().stream()
                    .map(BrapiListResponse.Stock::getStock)
                    .collect(java.util.stream.Collectors.toList());
            return cacheAcoes;
        }
        return java.util.Collections.emptyList();
    }

    @Override
    public Acao buscar(String ticker) {
        RestTemplate rest = new RestTemplate();
        String url = "https://brapi.dev/api/quote/" + ticker + "?token=" + token;

        BrapiResponseDTO response = rest.getForObject(url, BrapiResponseDTO.class);

        if (response == null || response.getResults() == null || response.getResults().isEmpty()) {
            throw new RuntimeException("Ticker não encontrado na brapi: " + ticker);
        }

        BrapiResponseDTO.Result r = response.getResults().get(0);

        Acao acao = new Acao();
        acao.setTicker(r.getSymbol());
        acao.setNomeEmpresa(r.getLongName());
        acao.setMoeda(r.getCurrency());
        acao.setMercado("BR");
        acao.setCotacaoAtual(r.getRegularMarketPrice());
        acao.setDataHoraCotacao(LocalDateTime.now());
        return acao;
    }
}