package com.crt.service;

import com.crt.adapter.cep.CepService;
import com.crt.adapter.cnpj.CnpjService;
import com.crt.dto.CepResponseDTO;
import com.crt.dto.CnpjResponseDTO;
import com.crt.entity.Corretora;
import com.crt.entity.Usuario;
import com.crt.exception.RecursoNaoEncontradoException;
import com.crt.repository.CorretoraRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class CorretoraService {
    private final RestTemplate rest;
    private final CnpjService cnpjService;
    private final CepService cepService;
    private final CorretoraRepository repository;
    private final com.crt.security.UsuarioAtual usuarioAtual;

    private Usuario getAuthenticatedUser() {
        return usuarioAtual.obter();
    }

    public Corretora cadastrar(String cnpj) {
        if (repository.findByCnpjAndUsuarioId(cnpj, getAuthenticatedUser().getId()).isPresent()) {
            throw new IllegalArgumentException("CNPJ ja cadastrado");
        }
        CnpjResponseDTO dados = cnpjService.buscar(cnpj);
        CepResponseDTO cepDados = null;
        if (dados.getCep() != null && !dados.getCep().isEmpty()) {
            try {
                cepDados = cepService.buscar(dados.getCep());
            } catch (Exception e) {
                org.slf4j.LoggerFactory.getLogger(getClass()).warn("consulta_cep_indisponivel");
            }
        }
        Corretora c = new Corretora();
        c.setCnpj(cnpj);
        c.setRazaoSocial(dados.getRazao_social());
        c.setNomeFantasia(dados.getNome_fantasia());
        c.setCep(dados.getCep());
        c.setUf(dados.getUf());
        c.setDataCadastro(LocalDateTime.now());

        boolean validada = false;
        try {

            rest.getForObject(
                    "https://brasilapi.com.br/api/cvm/corretoras/v1/" + cnpj, String.class);
            validada = true;
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(getClass()).warn("consulta_cvm_indisponivel");
        }
        c.setValidadaNaCvm(validada);
        if (cepDados != null) {
            c.setCidade(cepDados.getLocalidade());
            c.setLogradouro(cepDados.getLogradouro());
            c.setBairro(cepDados.getBairro());
        }
        c.setUsuario(getAuthenticatedUser());
        return repository.save(c);
    }

    public List<Corretora> listar() {
        return repository.findByUsuarioId(getAuthenticatedUser().getId());
    }

    public Corretora buscarPorId(Long id) {
        return repository
                .findByIdAndUsuarioId(id, getAuthenticatedUser().getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Corretora não encontrada"));
    }

    public Corretora buscarPorCnpj(String cnpj) {
        return repository
                .findByCnpjAndUsuarioId(cnpj, getAuthenticatedUser().getId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("CNPJ não encontrado"));
    }

    public void deletar(Long id) {
        Corretora corretora = buscarPorId(id);
        repository.delete(corretora);
    }
}
