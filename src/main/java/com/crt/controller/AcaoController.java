package com.crt.controller;
import com.crt.entity.Acao;
import com.crt.service.AcaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/acoes")
@RequiredArgsConstructor
public class AcaoController {
    private final AcaoService service;
    @PostMapping
    public Acao cadastrar(@RequestParam String ticker, @RequestParam String mercado, @RequestParam String cnpj) {
        return service.cadastrar(ticker, mercado, cnpj);
    }
    @GetMapping
    public List<Acao> listar() {
        return service.listar();
    }
    @GetMapping("/disponiveis")
    public List<com.crt.dto.AcaoDisponivelDTO> listarDisponiveis() {
        return service.listarDisponiveis();
    }
    @GetMapping("/{id}")
    public Acao buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }
    @GetMapping("/ticker/{ticker}")
    public Acao buscarPorTicker(@PathVariable String ticker) {
        return service.buscarPorTicker(ticker);
    }
    @PutMapping("/{id}/atualizar-cotacao")
    public Acao atualizarCotacao(@PathVariable Long id) {
        return service.atualizarCotacao(id);
    }
}
