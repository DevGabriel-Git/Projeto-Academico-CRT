package com.crt.dto;

import com.crt.entity.Corretora;
import java.time.LocalDateTime;
import java.util.List;

public record CorretoraResponse(
        Long id,
        String cnpj,
        String razaoSocial,
        String nomeFantasia,
        String cep,
        String logradouro,
        String bairro,
        String cidade,
        String uf,
        Boolean validadaNaCvm,
        LocalDateTime dataCadastro,
        List<AcaoResponse> acoes) {
    public static CorretoraResponse from(Corretora corretora) {
        return new CorretoraResponse(
                corretora.getId(),
                corretora.getCnpj(),
                corretora.getRazaoSocial(),
                corretora.getNomeFantasia(),
                corretora.getCep(),
                corretora.getLogradouro(),
                corretora.getBairro(),
                corretora.getCidade(),
                corretora.getUf(),
                corretora.getValidadaNaCvm(),
                corretora.getDataCadastro(),
                corretora.getAcoes().stream().map(AcaoResponse::from).toList());
    }
}
