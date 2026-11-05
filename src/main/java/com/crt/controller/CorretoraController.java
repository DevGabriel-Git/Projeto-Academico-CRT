package com.crt.controller;
import com.crt.entity.Corretora;
import com.crt.service.CorretoraService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/corretoras")
@RequiredArgsConstructor
public class CorretoraController {
    private final CorretoraService service;
    @PostMapping
    public Corretora cadastrar(@RequestParam String cnpj) {
        return service.cadastrar(cnpj);
    }
    @GetMapping
    public List<Corretora> listar(){
        return service.listar();
    }
    @GetMapping("/{id}")
    public Corretora buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id);
    }
    @GetMapping("/cnpj/{cnpj}")
    public Corretora buscarPorCnpj(@PathVariable String cnpj) {
        return service.buscarPorCnpj(cnpj);
    }
    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
    service.deletar(id);
}
}
