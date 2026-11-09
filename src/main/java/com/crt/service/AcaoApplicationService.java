package com.crt.service;

import com.crt.dto.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** Public contract boundary: domain entities remain inside the service layer. */
@Service
@RequiredArgsConstructor
public class AcaoApplicationService {
    private final AcaoService domain;

    public AcaoResponse cadastrar(String ticker, String mercado, String cnpj) {
        return AcaoResponse.from(domain.cadastrar(ticker, mercado, cnpj));
    }

    public List<AcaoResponse> listar() {
        return domain.listar().stream().map(AcaoResponse::from).toList();
    }

    public AcaoResponse buscarPorId(Long id) {
        return AcaoResponse.from(domain.buscarPorId(id));
    }

    public AcaoResponse buscarPorTicker(String ticker) {
        return AcaoResponse.from(domain.buscarPorTicker(ticker));
    }

    public AcaoResponse atualizarCotacao(Long id) {
        return AcaoResponse.from(domain.atualizarCotacao(id));
    }

    public List<AcaoDisponivelDTO> listarDisponiveis() {
        return domain.listarDisponiveis();
    }
}
