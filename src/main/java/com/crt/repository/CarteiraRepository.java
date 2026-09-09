package com.crt.repository;

import com.crt.entity.Carteira;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CarteiraRepository extends JpaRepository<Carteira, Long> {
    List<Carteira> findByCorretoraId(Long corretoraId);
    Optional<Carteira> findByCorretoraIdAndAcaoId(Long corretoraId, Long acaoId);
    List<Carteira> findByUsuarioId(Long usuarioId);
    Optional<Carteira> findByIdAndUsuarioId(Long id, Long usuarioId);
}