package com.crt.adapter;
import com.crt.adapter.acao.AlphaVantageService;
import com.crt.adapter.cep.ViaCepService;
import com.crt.dto.*;
import org.springframework.web.client.RestTemplate;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
class OtherAdaptersTest {
    RestTemplate rest=mock(RestTemplate.class);
    @Test void alphaMapeiaEValidaResposta(){
        var service=new AlphaVantageService(rest);
        assertThatThrownBy(()->service.buscar("X")).isInstanceOf(RuntimeException.class);
        var response=new AlphaVantageResponseDTO();
        when(rest.getForObject(anyString(),eq(AlphaVantageResponseDTO.class))).thenReturn(response);
        assertThatThrownBy(()->service.buscar("X")).isInstanceOf(RuntimeException.class);
        var quote=new AlphaVantageResponseDTO.GlobalQuote(); response.setGlobalQuote(quote);
        assertThatThrownBy(()->service.buscar("X")).isInstanceOf(RuntimeException.class);
        quote.setSymbol(""); assertThatThrownBy(()->service.buscar("X")).isInstanceOf(RuntimeException.class);
        quote.setSymbol("AAPL"); quote.setPrice("100.00");
        assertThat(service.buscar("AAPL").getCotacaoAtual()).isEqualByComparingTo("100.00");
    }
    @Test void viaCepPreservaResposta(){
        var response=new CepResponseDTO(); response.setLocalidade("Jales");
        when(rest.getForObject("https://viacep.com.br/ws/15700000/json/",CepResponseDTO.class)).thenReturn(response);
        assertThat(new ViaCepService(rest).buscar("15700000").getLocalidade()).isEqualTo("Jales");
    }
}
