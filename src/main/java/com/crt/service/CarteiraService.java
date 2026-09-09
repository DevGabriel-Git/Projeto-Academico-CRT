package com.crt.service;

import com.crt.dto.OperacaoDTO;
import com.crt.entity.Carteira;
import com.crt.entity.HistoricoCarteira;
import com.crt.repository.AcaoRepository;
import com.crt.repository.CarteiraRepository;
import com.crt.repository.CorretoraRepository;
import com.crt.repository.HistoricoCarteiraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import com.crt.entity.Usuario;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class CarteiraService {

    @Autowired
    private CarteiraRepository carteiraRepository;

    @Autowired
    private HistoricoCarteiraRepository historicoRepository;

    @Autowired
    private CorretoraRepository corretoraRepository;

    @Autowired
    private AcaoRepository acaoRepository;

    private Usuario getAuthenticatedUser() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public Carteira operar(OperacaoDTO dto) {
        var corretora = corretoraRepository.findById(dto.getCorretoraId())
                .orElseThrow(() -> new RuntimeException("Corretora não encontrada"));

        var acao = acaoRepository.findById(dto.getAcaoId())
                .orElseThrow(() -> new RuntimeException("Ação não encontrada"));

        Carteira carteira = carteiraRepository
                .findByCorretoraIdAndAcaoId(dto.getCorretoraId(), dto.getAcaoId())
                .orElseGet(() -> {
                    Carteira nova = new Carteira();
                    nova.setCorretora(corretora);
                    nova.setAcao(acao);
                    nova.setQuantidade(0);
                    nova.setPrecoMedio(BigDecimal.ZERO);
                    nova.setUsuario(getAuthenticatedUser());
                    return nova;
                });


        if ("COMPRA".equalsIgnoreCase(dto.getTipo())) {
            BigDecimal preco = dto.getPrecoUnitario() != null ? dto.getPrecoUnitario() : acao.getCotacaoAtual();

            BigDecimal totalAtual = carteira.getPrecoMedio()
                    .multiply(BigDecimal.valueOf(carteira.getQuantidade()));
            BigDecimal totalNovo = preco
                    .multiply(BigDecimal.valueOf(dto.getQuantidade()));
            int novaQtd = carteira.getQuantidade() + dto.getQuantidade();

            BigDecimal novoMedio = totalAtual.add(totalNovo)
                    .divide(BigDecimal.valueOf(novaQtd), 2, RoundingMode.HALF_UP);

            carteira.setQuantidade(novaQtd);
            carteira.setPrecoMedio(novoMedio);

            carteira.setDataAtualizacao(LocalDateTime.now());
            carteiraRepository.save(carteira);

            HistoricoCarteira historico = new HistoricoCarteira();
            historico.setCarteira(carteira);
            historico.setUsuario(getAuthenticatedUser());
            historico.setTipo("COMPRA");
            historico.setQuantidade(dto.getQuantidade());
            historico.setPrecoUnitario(preco);
            historico.setValorTotal(preco.multiply(BigDecimal.valueOf(dto.getQuantidade())));
            historico.setDataOperacao(LocalDateTime.now());
            historicoRepository.save(historico);

            return carteira;

        } else if ("VENDA".equalsIgnoreCase(dto.getTipo())) {
            if (dto.getQuantidade() > carteira.getQuantidade()) {
                throw new RuntimeException("Quantidade insuficiente para venda");
            }
            carteira.setQuantidade(carteira.getQuantidade() - dto.getQuantidade());
        } else {
            throw new RuntimeException("Tipo inválido. Use COMPRA ou VENDA.");
        }

        carteira.setDataAtualizacao(LocalDateTime.now());
        carteiraRepository.save(carteira);

        // Registra no histórico
        HistoricoCarteira historico = new HistoricoCarteira();
        historico.setCarteira(carteira);
        historico.setUsuario(getAuthenticatedUser());
        historico.setTipo(dto.getTipo().toUpperCase());
        historico.setQuantidade(dto.getQuantidade());
        historico.setPrecoUnitario(dto.getPrecoUnitario());
        historico.setValorTotal(dto.getPrecoUnitario()
                .multiply(BigDecimal.valueOf(dto.getQuantidade())));
        historico.setDataOperacao(LocalDateTime.now());
        historicoRepository.save(historico);

        return carteira;
    }

    public List<Carteira> listarPorCorretora(Long corretoraId) {
        return carteiraRepository.findByCorretoraId(corretoraId);
    }

    public Carteira buscarPorId(Long id) {
        return carteiraRepository.findByIdAndUsuarioId(id, getAuthenticatedUser().getId())
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));
    }

    public List<Carteira> listar() {
        return carteiraRepository.findByUsuarioId(getAuthenticatedUser().getId());
    }

    public List<HistoricoCarteira> listarHistorico(Long carteiraId) {
        return historicoRepository.findByCarteiraIdAndUsuarioId(carteiraId, getAuthenticatedUser().getId());
    }
}
