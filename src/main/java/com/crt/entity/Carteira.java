package com.crt.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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
public class Carteira {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    @Version
    private Long version;
    @ManyToOne
    @JoinColumn(name = "corretora_id")
    private Corretora corretora;
    @ManyToOne
    @JoinColumn(name = "acao_id")
    private Acao acao;
    private Integer quantidade;
    private BigDecimal precoMedio;
    private LocalDateTime dataAtualizacao;
    @OneToMany(mappedBy = "carteira", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<HistoricoCarteira> historico = new ArrayList<>();
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnore
    private Usuario usuario;
}
