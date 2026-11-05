package com.crt.controller;
import com.crt.dto.OperacaoDTO;
import com.crt.entity.Carteira;
import com.crt.entity.HistoricoCarteira;
import com.crt.service.CarteiraService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/carteira")
@RequiredArgsConstructor
public class CarteiraController {
    private final CarteiraService service;
    @PostMapping("/operar")
    public Carteira operar(@jakarta.validation.Valid @RequestBody OperacaoDTO dto) {
        return service.operar(dto);
    }
    @GetMapping("/{id}")
    public Carteira buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }
    @GetMapping
    public List<Carteira> listar() {
        return service.listar();
    }
    @GetMapping("/corretora/{corretoraId}")
    public List<Carteira> listarPorCorretora(@PathVariable Long corretoraId) {
        return service.listarPorCorretora(corretoraId);
    }
    @GetMapping("/{carteiraId}/historico")
    public List<HistoricoCarteira> listarHistorico(@PathVariable Long carteiraId) {
        return service.listarHistorico(carteiraId);
    }
}
