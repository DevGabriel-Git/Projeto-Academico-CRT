package com.crt.dto;

import com.crt.entity.Usuario;

public record UsuarioResponse(Long id, String nome, String email, String perfil) {
    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil().name());
    }
}
