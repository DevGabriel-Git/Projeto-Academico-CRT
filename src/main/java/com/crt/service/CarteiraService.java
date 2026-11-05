package com.crt.service;

import com.crt.dto.OperacaoDTO;
import com.crt.entity.Carteira;
import com.crt.entity.HistoricoCarteira;
import com.crt.exception.RecursoNaoEncontradoException;
import com.crt.repository.*;
import com.crt.security.UsuarioAtual;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CarteiraService {
    private final CarteiraRepository carteiraRepository;
    private final HistoricoCarteiraRepository historicoRepository;
    private final CorretoraRepository corretoraRepository;
    private final AcaoRepository acaoRepository;
    private final UsuarioAtual usuarioAtual;

    @Transactional
    public Carteira operar(@Valid OperacaoDTO dto) {
        var usuario = usuarioAtual.obter();
        var corretora =
                corretoraRepository
                        .findByIdAndUsuarioId(dto.getCorretoraId(), usuario.getId())
                        .orElseThrow(
                                () ->
                                        new RecursoNaoEncontradoException(
                                                "Corretora não encontrada"));
        var acao =
                acaoRepository
                        .findByIdAndUsuarioId(dto.getAcaoId(), usuario.getId())
                        .orElseThrow(
                                () -> new RecursoNaoEncontradoException("Ação não encontrada"));
        if (!corretora.getId().equals(acao.getCorretora().getId())) {
            throw new IllegalArgumentException("Ação não pertence à corretora informada");
        }
        var carteira =
                carteiraRepository
                        .findByCorretoraIdAndAcaoIdAndUsuarioId(
                                dto.getCorretoraId(), dto.getAcaoId(), usuario.getId())
                        .orElseGet(
                                () -> {
                                    var nova = new Carteira();
                                    nova.setCorretora(corretora);
                                    nova.setAcao(acao);
                                    nova.setUsuario(usuario);
                                    nova.setQuantidade(0);
                                    nova.setPrecoMedio(BigDecimal.ZERO);
                                    return nova;
                                });
        var preco =
                dto.getPrecoUnitario() == null ? acao.getCotacaoAtual() : dto.getPrecoUnitario();
        if (preco == null || preco.signum() <= 0) {
            throw new IllegalArgumentException("Preço unitário deve ser positivo");
        }
        if ("COMPRA".equalsIgnoreCase(dto.getTipo())) {
            comprar(carteira, dto.getQuantidade(), preco);
        } else if ("VENDA".equalsIgnoreCase(dto.getTipo())) {
            vender(carteira, dto.getQuantidade());
        } else {
            throw new IllegalArgumentException("Tipo inválido. Use COMPRA ou VENDA.");
        }
        carteira.setDataAtualizacao(LocalDateTime.now());
        carteiraRepository.save(carteira);
        var historico = new HistoricoCarteira();
        historico.setCarteira(carteira);
        historico.setUsuario(usuario);
        historico.setTipo(dto.getTipo().toUpperCase(java.util.Locale.ROOT));
        historico.setQuantidade(dto.getQuantidade());
        historico.setPrecoUnitario(preco);
        historico.setValorTotal(preco.multiply(BigDecimal.valueOf(dto.getQuantidade())));
        historico.setDataOperacao(carteira.getDataAtualizacao());
        historicoRepository.save(historico);
        if (org.springframework.transaction.support.TransactionSynchronizationManager
                .isSynchronizationActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager
                    .registerSynchronization(
                            new org.springframework.transaction.support
                                    .TransactionSynchronization() {
                                @Override
                                public void afterCommit() {
                                    io.micrometer.core.instrument.Metrics.counter(
                                                    "corretora.operacoes",
                                                    "tipo",
                                                    historico.getTipo())
                                            .increment();
                                }
                            });
        }
        return carteira;
    }

    private void comprar(Carteira carteira, int quantidade, BigDecimal preco) {
        int novaQuantidade = Math.addExact(carteira.getQuantidade(), quantidade);
        var custoAtual =
                carteira.getPrecoMedio().multiply(BigDecimal.valueOf(carteira.getQuantidade()));
        var custoCompra = preco.multiply(BigDecimal.valueOf(quantidade));
        carteira.setPrecoMedio(
                custoAtual
                        .add(custoCompra)
                        .divide(BigDecimal.valueOf(novaQuantidade), 2, RoundingMode.HALF_UP));
        carteira.setQuantidade(novaQuantidade);
    }

    private void vender(Carteira carteira, int quantidade) {
        if (quantidade > carteira.getQuantidade()) {
            throw new IllegalArgumentException("Quantidade insuficiente para venda");
        }
        carteira.setQuantidade(carteira.getQuantidade() - quantidade);
    }

    public List<Carteira> listarPorCorretora(Long corretoraId) {
        return carteiraRepository.findByCorretoraIdAndUsuarioId(
                corretoraId, usuarioAtual.obter().getId());
    }

    public Carteira buscarPorId(Long id) {
        return carteiraRepository
                .findByIdAndUsuarioId(id, usuarioAtual.obter().getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Carteira não encontrada"));
    }

    public List<Carteira> listar() {
        return carteiraRepository.findByUsuarioId(usuarioAtual.obter().getId());
    }

    public List<HistoricoCarteira> listarHistorico(Long carteiraId) {
        buscarPorId(carteiraId);
        return historicoRepository.findByCarteiraIdAndUsuarioId(
                carteiraId, usuarioAtual.obter().getId());
    }
}
