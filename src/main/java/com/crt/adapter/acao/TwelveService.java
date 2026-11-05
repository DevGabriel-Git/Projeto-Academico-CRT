package com.crt.adapter.acao;
import com.crt.dto.TwelveDataResponseDTO;
import com.crt.entity.Acao;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
@Service("twelveDataAcaoService")
@lombok.RequiredArgsConstructor
public class TwelveService implements AcaoApi{
    private final RestTemplate rest;
    @Value("${twelvedata.key}")
    private String apiKey;
    @Override
    public Acao buscar(String ticker) {

        String url = "https://api.twelvedata.com/quote?symbol=" + ticker + "&apikey=" + apiKey;
        TwelveDataResponseDTO response = rest.getForObject(url, TwelveDataResponseDTO.class);
        if (response == null || response.getSymbol() == null) {
            throw new RuntimeException("Ticker não encontrado no TwelveData: " + ticker);
        }
        Acao acao = new Acao();
        acao.setTicker(response.getSymbol());
        acao.setNomeEmpresa(response.getName());
        acao.setMoeda(response.getCurrency());
        acao.setMercado("EUA");
        acao.setCotacaoAtual(response.getClose());
        acao.setDataHoraCotacao(LocalDateTime.now());
        return acao;
    }
}
