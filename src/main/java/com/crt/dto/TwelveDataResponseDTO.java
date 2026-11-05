package com.crt.dto;

import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TwelveDataResponseDTO {

    private String symbol;
    private String name;
    private String currency;
    private BigDecimal close;
}
