package com.crt.controller;

import com.crt.dto.CarteiraResponse;
import com.crt.dto.HistoricoResponse;
import com.crt.dto.OperacaoDTO;
import com.crt.service.CarteiraApplicationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carteira")
@RequiredArgsConstructor
public class CarteiraController {
    private final CarteiraApplicationService service;

    @PostMapping("/operar")
    public CarteiraResponse operar(@jakarta.validation.Valid @RequestBody OperacaoDTO dto) {
        return service.operar(dto);
    }

    @GetMapping("/{id}")
    public CarteiraResponse buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @GetMapping
    public List<CarteiraResponse> listar() {
        return service.listar();
    }

    @GetMapping("/corretora/{corretoraId}")
    public List<CarteiraResponse> listarPorCorretora(@PathVariable Long corretoraId) {
        return service.listarPorCorretora(corretoraId);
    }

    @GetMapping("/{carteiraId}/historico")
    public List<HistoricoResponse> listarHistorico(@PathVariable Long carteiraId) {
        return service.listarHistorico(carteiraId);
    }
}
