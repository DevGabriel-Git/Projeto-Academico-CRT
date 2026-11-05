package com.crt.dto;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
@Getter
@Setter
public class OperacaoDTO {
    @NotNull @Positive
    private Long corretoraId;
    @NotNull @Positive
    private Long acaoId;
    @NotNull @Pattern(regexp = "(?i)COMPRA|VENDA")
    private String tipo; // COMPRA ou VENDA
    @NotNull @Positive
    private Integer quantidade;
    @DecimalMin(value = "0", inclusive = false)
    private BigDecimal precoUnitario;
}
