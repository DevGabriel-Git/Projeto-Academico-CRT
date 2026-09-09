package com.crt.dto;

public class AcaoDisponivelDTO {
    private String ticker;
    private String mercado;

    public AcaoDisponivelDTO(String ticker, String mercado) {
        this.ticker = ticker;
        this.mercado = mercado;
    }

    public String getTicker() { return ticker; }
    public void setTicker(String ticker) { this.ticker = ticker; }
    public String getMercado() { return mercado; }
    public void setMercado(String mercado) { this.mercado = mercado; }
}
