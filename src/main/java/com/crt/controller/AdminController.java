package com.crt.controller;

import com.crt.dto.UsuariosPageResponse;
import com.crt.service.AdminApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminApplicationService service;

    @GetMapping("/usuarios")
    public UsuariosPageResponse usuarios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return service.listarUsuarios(page, size);
    }
}
