package com.crt.repository;

import com.crt.entity.Acao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcaoRepository extends JpaRepository<Acao, Long> {
    Optional<Acao> findByTicker(String ticker);

    Optional<Acao> findByTickerAndUsuarioId(String ticker, Long usuarioId);

    List<Acao> findByUsuarioId(Long usuarioId);

    Optional<Acao> findByIdAndUsuarioId(Long id, Long usuarioId);
}
