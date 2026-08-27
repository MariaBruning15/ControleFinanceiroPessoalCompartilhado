package com.ifpr.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import com.ifpr.backend.model.enums.PapelCarteira;

@Entity
@Table(
    name = "tb_carteira_membro",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"carteira_id", "usuario_id"})
    }
)

public class CarteiraMembro {
     @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carteira_id", nullable = false)
    private Carteira carteira;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PapelCarteira papel;

    @Column(nullable = false, updatable = false)
    private LocalDateTime adicionadoEm;

    @PrePersist
    public void onCreate() {
        this.adicionadoEm = LocalDateTime.now();
    }

    public CarteiraMembro() {}

    public CarteiraMembro(Carteira carteira, Usuario usuario, PapelCarteira papel) {
        this.carteira = carteira;
        this.usuario = usuario;
        this.papel = papel;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Carteira getCarteira() { return carteira; }
    public void setCarteira(Carteira carteira) { this.carteira = carteira; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public PapelCarteira getPapel() { return papel; }
    public void setPapel(PapelCarteira papel) { this.papel = papel; }

    public LocalDateTime getAdicionadoEm() { return adicionadoEm; }
    public void setAdicionadoEm(LocalDateTime adicionadoEm) { this.adicionadoEm = adicionadoEm; }
}
