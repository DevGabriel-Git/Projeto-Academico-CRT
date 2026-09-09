package com.crt.repository;

import com.crt.entity.HistoricoCarteira;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HistoricoCarteiraRepository extends JpaRepository<HistoricoCarteira, Long> {
    List<HistoricoCarteira> findByCarteiraId(Long carteiraId);
    List<HistoricoCarteira> findByUsuarioId(Long usuarioId);
    Optional<HistoricoCarteira> findByIdAndUsuarioId(Long id, Long usuarioId);
    List<HistoricoCarteira> findByCarteiraIdAndUsuarioId(Long carteiraId, Long usuarioId);
}
