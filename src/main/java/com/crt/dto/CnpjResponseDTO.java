package com.crt.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CnpjResponseDTO {

    private String razao_social;
    private String nome_fantasia;
    private String cep;
    private String uf;
}
