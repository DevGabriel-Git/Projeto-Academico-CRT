package com.crt.security;

import com.crt.entity.Usuario;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;

@Component

public class UsuarioAtual {

    public Usuario obter() {

        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof Usuario usuario)) {

            throw new AuthenticationCredentialsNotFoundException("Autenticação necessária");

        }

        return usuario;

    }

}
