package com.crt.service;

import com.crt.dto.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** Public contract boundary: domain entities remain inside the service layer. */
@Service
@RequiredArgsConstructor
public class CorretoraApplicationService {
    private final CorretoraService domain;

    public CorretoraResponse cadastrar(String cnpj) {
        return CorretoraResponse.from(domain.cadastrar(cnpj));
    }

    public List<CorretoraResponse> listar() {
        return domain.listar().stream().map(CorretoraResponse::from).toList();
    }

    public CorretoraResponse buscarPorId(Long id) {
        return CorretoraResponse.from(domain.buscarPorId(id));
    }

    public CorretoraResponse buscarPorCnpj(String cnpj) {
        return CorretoraResponse.from(domain.buscarPorCnpj(cnpj));
    }

    public void deletar(Long id) {
        domain.deletar(id);
    }
}
