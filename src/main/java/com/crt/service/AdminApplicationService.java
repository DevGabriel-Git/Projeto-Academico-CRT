package com.crt.service;

import com.crt.dto.UsuarioResponse;
import com.crt.dto.UsuariosPageResponse;
import com.crt.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminApplicationService {
    private static final int MAX_PAGE_SIZE = 100;
    private final UsuarioRepository usuarios;

    @Transactional(readOnly = true)
    public UsuariosPageResponse listarUsuarios(int page, int size) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("Paginacao invalida");
        }
        var resultado = usuarios.findAll(PageRequest.of(page, size, Sort.by("id")));
        return new UsuariosPageResponse(
                resultado.stream().map(UsuarioResponse::from).toList(),
                page,
                size,
                resultado.getTotalElements(),
                resultado.getTotalPages());
    }
}
