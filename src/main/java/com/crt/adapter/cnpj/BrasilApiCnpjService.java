package com.crt.adapter.cnpj;

import com.crt.dto.CnpjResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class BrasilApiCnpjService implements CnpjService {

    @Override
    public CnpjResponseDTO buscar(String cnpj) {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        RestTemplate rest = new RestTemplate(factory);
        String url = "https://brasilapi.com.br/api/cnpj/v1/" + cnpj;

        try {
            return rest.getForObject(url, CnpjResponseDTO.class);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar CNPJ na BrasilAPI: " + e.getMessage());
        }
    }
}