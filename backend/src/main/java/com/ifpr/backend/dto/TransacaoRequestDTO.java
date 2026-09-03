package com.ifpr.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.ifpr.backend.model.enums.TipoTransacao;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class TransacaoRequestDTO {

    @NotNull(message = "A carteira é obrigatória.")
    private UUID carteiraId;

    private UUID categoriaId;

    @NotNull(message = "O tipo da transação é obrigatório.")
    private TipoTransacao tipo;

    @NotNull(message = "O valor é obrigatório.")
    @Positive(message = "O valor deve ser maior que zero.")
    private BigDecimal valor;

    private String descricao;

    @NotNull(message = "A data da transação é obrigatória.")
    private LocalDate data;

    public UUID getCarteiraId() { return carteiraId; }
    public void setCarteiraId(UUID carteiraId) { this.carteiraId = carteiraId; }

    public UUID getCategoriaId() { return categoriaId; }
    public void setCategoriaId(UUID categoriaId) { this.categoriaId = categoriaId; }

    public TipoTransacao getTipo() { return tipo; }
    public void setTipo(TipoTransacao tipo) { this.tipo = tipo; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
}