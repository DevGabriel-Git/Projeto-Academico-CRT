package com.crt.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Corretora {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    private String cnpj;
    private String razaoSocial;
    private String nomeFantasia;
    private String cep;
    private String logradouro;
    private String bairro;
    private String cidade;
    private String uf;
    private Boolean validadaNaCvm;
    private LocalDateTime dataCadastro;

    @OneToMany(mappedBy = "corretora", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Acao> acoes = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnore
    private Usuario usuario;
}

