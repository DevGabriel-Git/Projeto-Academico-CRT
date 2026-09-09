package com.crt.service;

import com.crt.adapter.cep.CepService;
import com.crt.adapter.cnpj.CnpjService;
import com.crt.dto.CepResponseDTO;
import com.crt.dto.CnpjResponseDTO;
import com.crt.entity.Corretora;
import com.crt.repository.CorretoraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import com.crt.entity.Usuario;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.client.RestTemplate;

@Service
public class CorretoraService {

    @Autowired
    private CnpjService cnpjService;

    @Autowired
    private CepService cepService;

    @Autowired
    private CorretoraRepository repository;

    private Usuario getAuthenticatedUser() {
        return (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    public Corretora cadastrar(String cnpj){

        if (repository.findByCnpjAndUsuarioId(cnpj, getAuthenticatedUser().getId()).isPresent()){
            throw new RuntimeException("CNPJ já cadastrado");
        }

        CnpjResponseDTO dados;
        try {
            dados = cnpjService.buscar(cnpj);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

        CepResponseDTO cepDados = null;

        if (dados.getCep() != null && !dados.getCep().isEmpty()) {
            try {
                cepDados = cepService.buscar(dados.getCep());
            } catch (Exception e) {
                System.out.println("Erro ao buscar CEP");
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
            RestTemplate rest = new RestTemplate();
            rest.getForObject("https://brasilapi.com.br/api/cvm/corretoras/v1/" + cnpj, String.class);
            validada = true;
        } catch (Exception e) {
            System.out.println("Não encontrada na CVM.");
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
    
    public List<Corretora> listar() { return repository.findByUsuarioId(getAuthenticatedUser().getId()); }

    public Corretora buscarPorId(Long id) { return repository.findByIdAndUsuarioId(id, getAuthenticatedUser().getId()) .orElseThrow(() -> new RuntimeException("Corretora não encontrada"));
    }
    
    public Corretora buscarPorCnpj(String cnpj) { return repository.findByCnpjAndUsuarioId(cnpj, getAuthenticatedUser().getId()) .orElseThrow(() -> new RuntimeException("CNPJ não encontrado"));
    }
    
    public void deletar(Long id) { Corretora corretora = buscarPorId(id); repository.delete(corretora); }
}
