package com.crt.repository;

import com.crt.entity.Corretora;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CorretoraRepository extends JpaRepository<Corretora, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"acoes"})
    Optional<Corretora> findByCnpj(String cnpj);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"acoes"})
    Optional<Corretora> findByCnpjAndUsuarioId(String cnpj, Long usuarioId);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"acoes"})
    List<Corretora> findByUsuarioId(Long usuarioId);
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"acoes"})
    Optional<Corretora> findByIdAndUsuarioId(Long id, Long usuarioId);
}
