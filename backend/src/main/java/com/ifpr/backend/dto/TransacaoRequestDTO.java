package com.ifpr.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.ifpr.backend.model.enums.TipoTransacao;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

public class TransacaoRequestDTO {

    @NotNull(message = "O tipo é obrigatório")
    private TipoTransacao tipo;

    @NotNull(message = "O valor é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
    private BigDecimal valor;

    private String descricao;

    @NotNull(message = "A data é obrigatória")
    @PastOrPresent(message = "A data não pode ser futura")
    private LocalDate data;

    @NotNull(message = "A categoria é obrigatória")
    private UUID categoriaId;

    public TransacaoRequestDTO() {
    }

    public TransacaoRequestDTO(TipoTransacao tipo, BigDecimal valor, String descricao, LocalDate data, UUID categoriaId) {
        this.tipo = tipo;
        this.valor = valor;
        this.descricao = descricao;
        this.data = data;
        this.categoriaId = categoriaId;
    }

    public TipoTransacao getTipo() {
        return tipo;
    }

    public void setTipo(TipoTransacao tipo) {
        this.tipo = tipo;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public UUID getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(UUID categoriaId) {
        this.categoriaId = categoriaId;
    }
}