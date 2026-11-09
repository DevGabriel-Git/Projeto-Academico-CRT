package com.crt.repository;

import com.crt.entity.Carteira;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarteiraRepository extends JpaRepository<Carteira, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"corretora.acoes"})
    List<Carteira> findByCorretoraIdAndUsuarioId(Long corretoraId, Long usuarioId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"corretora.acoes"})
    Optional<Carteira> findByCorretoraIdAndAcaoIdAndUsuarioId(
            Long corretoraId, Long acaoId, Long usuarioId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"corretora.acoes"})
    List<Carteira> findByUsuarioId(Long usuarioId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"corretora.acoes"})
    Optional<Carteira> findByIdAndUsuarioId(Long id, Long usuarioId);
}
