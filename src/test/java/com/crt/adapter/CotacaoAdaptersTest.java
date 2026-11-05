package com.crt.adapter;
import com.crt.adapter.acao.*;
import com.crt.dto.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.util.List;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
class CotacaoAdaptersTest {
    RestTemplate rest=mock(RestTemplate.class);
    @Test void brapiMapeiaCotacaoERejeitaRespostaInvalida(){
        var service=new BrapiService(rest); var response=new BrapiResponseDTO();
        var result=new BrapiResponseDTO.Result(); result.setSymbol("PETR4"); result.setRegularMarketPrice(new BigDecimal("30"));
        response.setResults(List.of(result)); when(rest.getForObject(anyString(),eq(BrapiResponseDTO.class))).thenReturn(response);
        assertThat(service.buscar("PETR4").getCotacaoAtual()).isEqualByComparingTo("30");
        response.setResults(List.of()); assertThatThrownBy(()->service.buscar("X")).isInstanceOf(RuntimeException.class);
        response.setResults(null); assertThatThrownBy(()->service.buscar("X")).isInstanceOf(RuntimeException.class);
        when(rest.getForObject(anyString(),eq(BrapiResponseDTO.class))).thenReturn(null);
        assertThatThrownBy(()->service.buscar("X")).isInstanceOf(RuntimeException.class);
    }
    @Test void brapiListaEReutilizaCache(){
        var service=new BrapiService(rest); var response=new BrapiService.BrapiListResponse();
        var stock=new BrapiService.BrapiListResponse.Stock(); stock.setStock("PETR4"); response.setStocks(List.of(stock));
        when(rest.getForObject(anyString(),eq(BrapiService.BrapiListResponse.class))).thenReturn(response);
        assertThat(service.listarDisponiveis()).containsExactly("PETR4"); service.listarDisponiveis();
        verify(rest,times(1)).getForObject(anyString(),eq(BrapiService.BrapiListResponse.class));
    }
    @Test void brapiListaVaziaComRespostaAusente(){
        var service=new BrapiService(rest); assertThat(service.listarDisponiveis()).isEmpty();
        when(rest.getForObject(anyString(),eq(BrapiService.BrapiListResponse.class))).thenReturn(new BrapiService.BrapiListResponse());
        assertThat(service.listarDisponiveis()).isEmpty();
    }
    @Test void twelveMapeiaCotacaoERejeitaRespostaInvalida(){
        var service=new TwelveService(rest); var response=new TwelveDataResponseDTO(); response.setSymbol("AAPL"); response.setClose(new BigDecimal("100"));
        when(rest.getForObject(anyString(),eq(TwelveDataResponseDTO.class))).thenReturn(response);
        assertThat(service.buscar("AAPL").getCotacaoAtual()).isEqualByComparingTo("100");
        response.setSymbol(null); assertThatThrownBy(()->service.buscar("X")).isInstanceOf(RuntimeException.class);
        when(rest.getForObject(anyString(),eq(TwelveDataResponseDTO.class))).thenReturn(null);
        assertThatThrownBy(()->service.buscar("X")).isInstanceOf(RuntimeException.class);
    }
}
