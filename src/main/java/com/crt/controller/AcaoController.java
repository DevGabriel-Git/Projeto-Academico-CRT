package com.crt.controller;

import com.crt.dto.AcaoResponse;
import com.crt.service.AcaoApplicationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/acoes")
@RequiredArgsConstructor
public class AcaoController {
    private final AcaoApplicationService service;

    @PostMapping
    public AcaoResponse cadastrar(
            @RequestParam String ticker, @RequestParam String mercado, @RequestParam String cnpj) {
        return service.cadastrar(ticker, mercado, cnpj);
    }

    @GetMapping
    public List<AcaoResponse> listar() {
        return service.listar();
    }

    @GetMapping("/disponiveis")
    public List<com.crt.dto.AcaoDisponivelDTO> listarDisponiveis() {
        return service.listarDisponiveis();
    }

    @GetMapping("/{id}")
    public AcaoResponse buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/ticker/{ticker}")
    public AcaoResponse buscarPorTicker(@PathVariable String ticker) {
        return service.buscarPorTicker(ticker);
    }

    @PutMapping("/{id}/atualizar-cotacao")
    public AcaoResponse atualizarCotacao(@PathVariable Long id) {
        return service.atualizarCotacao(id);
    }
}
