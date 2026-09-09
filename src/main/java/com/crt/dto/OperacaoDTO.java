package com.crt.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class OperacaoDTO {
    private Long corretoraId;
    private Long acaoId;
    private String tipo; // COMPRA ou VENDA
    private Integer quantidade;
    private BigDecimal precoUnitario = BigDecimal.ZERO;
}
