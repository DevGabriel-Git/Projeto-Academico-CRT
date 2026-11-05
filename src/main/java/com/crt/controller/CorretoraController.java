package com.crt.controller;

import com.crt.dto.CorretoraResponse;
import com.crt.service.CorretoraApplicationService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/corretoras")
@RequiredArgsConstructor
public class CorretoraController {
    private final CorretoraApplicationService service;

    @PostMapping
    public CorretoraResponse cadastrar(@RequestParam String cnpj) {
        return service.cadastrar(cnpj);
    }

    @GetMapping
    public List<CorretoraResponse> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public CorretoraResponse buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/cnpj/{cnpj}")
    public CorretoraResponse buscarPorCnpj(@PathVariable String cnpj) {
        return service.buscarPorCnpj(cnpj);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
