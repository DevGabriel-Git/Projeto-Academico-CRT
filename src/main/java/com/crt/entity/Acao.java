package com.crt.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Acao {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @EqualsAndHashCode.Include
    private String ticker;

    private String nomeEmpresa;
    private String mercado;
    private String moeda;
    private BigDecimal cotacaoAtual;
    private LocalDateTime dataHoraCotacao;

    @ManyToOne
    @JoinColumn(name = "corretora_id")
    @JsonIgnore
    private Corretora corretora;

    @OneToMany(mappedBy = "acao", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Carteira> carteiras = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnore
    private Usuario usuario;
}
