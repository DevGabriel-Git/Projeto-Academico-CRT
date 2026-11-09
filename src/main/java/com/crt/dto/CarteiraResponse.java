package com.crt.dto;

import com.crt.entity.Carteira;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CarteiraResponse(
        Long id,
        Long version,
        Integer quantidade,
        BigDecimal precoMedio,
        LocalDateTime dataAtualizacao,
        AcaoResponse acao,
        CorretoraResponse corretora) {
    public static CarteiraResponse from(Carteira carteira) {
        return new CarteiraResponse(
                carteira.getId(),
                carteira.getVersion(),
                carteira.getQuantidade(),
                carteira.getPrecoMedio(),
                carteira.getDataAtualizacao(),
                AcaoResponse.from(carteira.getAcao()),
                CorretoraResponse.from(carteira.getCorretora()));
    }
}
