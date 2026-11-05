package com.crt.adapter.cnpj;

import com.crt.dto.CnpjResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class BrasilApiCnpjService implements CnpjService {
    private final RestTemplate rest;

    @Override
    public CnpjResponseDTO buscar(String cnpj) {
        return rest.getForObject("https://brasilapi.com.br/api/cnpj/v1/" + cnpj, CnpjResponseDTO.class);
    }
}
