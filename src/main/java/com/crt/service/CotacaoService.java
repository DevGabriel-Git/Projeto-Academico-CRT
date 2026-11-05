package com.crt.service;
import com.crt.adapter.acao.AcaoApi;
import com.crt.entity.Acao;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Qualifier;
import java.util.Locale;
import java.util.Map;
/** Seleciona a estratégia de cotação pela região do mercado. */
@Service
public class CotacaoService {
    private final Map<String, AcaoApi> provedores;
    public CotacaoService(@Qualifier("brapiAcaoService") AcaoApi brasil,
                          @Qualifier("twelveDataAcaoService") AcaoApi estadosUnidos) {
        provedores = Map.of("BR", brasil, "EUA", estadosUnidos);
    }
    public Acao buscar(String mercado, String ticker) {
        var provedor = mercado == null ? null : provedores.get(mercado.toUpperCase(Locale.ROOT));
        if (provedor == null) throw new IllegalArgumentException("Mercado inválido. Use BR ou EUA.");
        return provedor.buscar(ticker);
    }
}
