package com.crt.dto;

import com.crt.entity.HistoricoCarteira;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record HistoricoResponse(
        Long id,
        String tipo,
        Integer quantidade,
        BigDecimal precoUnitario,
        BigDecimal valorTotal,
        LocalDateTime dataOperacao) {
    public static HistoricoResponse from(HistoricoCarteira historico) {
        return new HistoricoResponse(
                historico.getId(),
                historico.getTipo(),
                historico.getQuantidade(),
                historico.getPrecoUnitario(),
                historico.getValorTotal(),
                historico.getDataOperacao());
    }
}
