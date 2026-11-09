package com.crt.service;

import com.crt.dto.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** Public contract boundary: domain entities remain inside the service layer. */
@Service
@RequiredArgsConstructor
public class CarteiraApplicationService {
    private final CarteiraService domain;

    public CarteiraResponse operar(OperacaoDTO dto) {
        return CarteiraResponse.from(domain.operar(dto));
    }

    public CarteiraResponse buscarPorId(Long id) {
        return CarteiraResponse.from(domain.buscarPorId(id));
    }

    public List<CarteiraResponse> listar() {
        return domain.listar().stream().map(CarteiraResponse::from).toList();
    }

    public List<CarteiraResponse> listarPorCorretora(Long corretoraId) {
        return domain.listarPorCorretora(corretoraId).stream().map(CarteiraResponse::from).toList();
    }

    public List<HistoricoResponse> listarHistorico(Long carteiraId) {
        return domain.listarHistorico(carteiraId).stream().map(HistoricoResponse::from).toList();
    }
}
