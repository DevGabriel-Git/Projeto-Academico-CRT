package com.crt.dto;

import java.util.List;

public record UsuariosPageResponse(
        List<UsuarioResponse> items, int page, int size, long totalElements, int totalPages) {}
