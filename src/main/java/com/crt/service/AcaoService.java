package com.crt.service;
import com.crt.adapter.acao.BrapiService;
import com.crt.adapter.acao.TwelveService;
import com.crt.entity.Acao;
import com.crt.entity.Corretora;
import com.crt.repository.AcaoRepository;
import com.crt.repository.CorretoraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import com.crt.entity.Usuario;
import org.springframework.security.core.context.SecurityContextHolder;
@Service
@RequiredArgsConstructor
public class AcaoService {
    private final AcaoRepository repository;
    private final BrapiService brapiAcaoService;
    private final CotacaoService cotacaoService;
    private final CorretoraRepository corretoraRepository;
    private final com.crt.security.UsuarioAtual usuarioAtual;
    private Usuario getAuthenticatedUser() { return usuarioAtual.obter(); }
    public Acao cadastrar(String ticker, String mercado, String cnpj) {
        if (repository.findByTickerAndUsuarioId(ticker, getAuthenticatedUser().getId()).isPresent()) {
            throw new RuntimeException("Ticker já cadastrado: " + ticker);
        }
        Corretora corretora = corretoraRepository.findByCnpjAndUsuarioId(cnpj, getAuthenticatedUser().getId())
                .orElseThrow(() -> new RuntimeException("Corretora não encontrada"));
        Acao acao = cotacaoService.buscar(mercado, ticker);
        acao.setCorretora(corretora); // <-- associa a corretora
        acao.setUsuario(getAuthenticatedUser());
        return repository.save(acao);
    }
    public List<Acao> listar() {
        return repository.findByUsuarioId(getAuthenticatedUser().getId());
    }
    public List<com.crt.dto.AcaoDisponivelDTO> listarDisponiveis() {
        List<String> brapiList = brapiAcaoService.listarDisponiveis();
        List<com.crt.dto.AcaoDisponivelDTO> result = new java.util.ArrayList<>();

        // Add hardcoded top US stocks
        String[] topUsStocks = {"AAPL", "MSFT", "GOOGL", "AMZN", "META", "TSLA", "NVDA", "NFLX"};
        for (String usTicker : topUsStocks) {
            result.add(new com.crt.dto.AcaoDisponivelDTO(usTicker, "EUA"));
        }

        // Add Brazilian stocks
        for (String brTicker : brapiList) {
            result.add(new com.crt.dto.AcaoDisponivelDTO(brTicker, "BR"));
        }

        return result;
    }
    public Acao buscarPorId(Long id) {
        return repository.findByIdAndUsuarioId(id, getAuthenticatedUser().getId())
                .orElseThrow(() -> new RuntimeException("Ação não encontrada"));
    }
    public Acao buscarPorTicker(String ticker) {
        return repository.findByTickerAndUsuarioId(ticker, getAuthenticatedUser().getId())
                .orElseThrow(() -> new RuntimeException("Ticker não encontrado"));
    }
    public Acao atualizarCotacao(Long id) {
        Acao acao = buscarPorId(id);
        Acao atualizada = cotacaoService.buscar(acao.getMercado(), acao.getTicker());
        acao.setCotacaoAtual(atualizada.getCotacaoAtual());
        acao.setDataHoraCotacao(LocalDateTime.now());
        return repository.save(acao);
    }
}
