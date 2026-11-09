package com.crt.service;

import static org.assertj.core.api.Assertions.*;

import com.crt.entity.Acao;
import org.junit.jupiter.api.Test;

class CotacaoServiceTest {
    @Test
    void selecionaProvedorPeloMercado() {
        Acao brasil = new Acao();
        Acao eua = new Acao();
        var service = new CotacaoService(ticker -> brasil, ticker -> eua);
        assertThat(service.buscar("br", "PETR4")).isSameAs(brasil);
        assertThat(service.buscar("EUA", "AAPL")).isSameAs(eua);
        assertThatThrownBy(() -> service.buscar("EU", "SAP"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.buscar(null, "SAP"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
