package com.crt.repository;

import com.crt.entity.Corretora;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CorretoraRepository extends JpaRepository<Corretora, Long> {
    Optional<Corretora> findByCnpj(String cnpj);
    Optional<Corretora> findByCnpjAndUsuarioId(String cnpj, Long usuarioId);
    List<Corretora> findByUsuarioId(Long usuarioId);
    Optional<Corretora> findByIdAndUsuarioId(Long id, Long usuarioId);
}
