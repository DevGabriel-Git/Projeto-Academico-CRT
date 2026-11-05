package com.crt.adapter.cep;
import com.crt.dto.CepResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
@Service
@lombok.RequiredArgsConstructor
public class ViaCepService implements CepService {
    private final RestTemplate rest;
    @Override
    public CepResponseDTO buscar(String cep) {

        String url = "https://viacep.com.br/ws/" + cep + "/json/";
        return rest.getForObject(url, CepResponseDTO.class);
    }
}
