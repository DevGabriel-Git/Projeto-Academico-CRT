package com.crt.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OperacaoDTO {
    @NotNull @Positive private Long corretoraId;
    @NotNull @Positive private Long acaoId;

    @NotNull
    @Pattern(regexp = "(?i)COMPRA|VENDA")
    private String tipo; // COMPRA ou VENDA

    @NotNull @Positive private Integer quantidade;

    @DecimalMin(value = "0", inclusive = false)
    @jakarta.validation.constraints.Digits(integer = 36, fraction = 2)
    private BigDecimal precoUnitario;
}
