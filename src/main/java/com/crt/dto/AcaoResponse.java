package com.crt.dto;

import com.crt.entity.Acao;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AcaoResponse(
        Long id,
        String ticker,
        String nomeEmpresa,
        String mercado,
        String moeda,
        BigDecimal cotacaoAtual,
        LocalDateTime dataHoraCotacao) {
    public static AcaoResponse from(Acao acao) {
        return new AcaoResponse(
                acao.getId(),
                acao.getTicker(),
                acao.getNomeEmpresa(),
                acao.getMercado(),
                acao.getMoeda(),
                acao.getCotacaoAtual(),
                acao.getDataHoraCotacao());
    }
}
