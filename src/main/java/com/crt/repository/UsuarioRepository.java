package com.crt.repository;

import com.crt.entity.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByCpf(String cpf);

    boolean existsByPerfil(com.crt.entity.Perfil perfil);

    @org.springframework.data.jpa.repository.Query(
            value = "SELECT id FROM admin_bootstrap_lock WHERE id = 1 FOR UPDATE",
            nativeQuery = true)
    Integer bloquearInicializacaoAdmin();
}
