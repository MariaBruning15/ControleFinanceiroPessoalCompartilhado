package com.ifpr.backend.dto;

import com.ifpr.backend.model.enums.TipoTransacao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CategoriaRequestDTO {

    @NotBlank(message = "O nome da categoria é obrigatório.")
    private String nome;

    @NotNull(message = "O tipo é obrigatório (RECEITA ou DESPESA).")
    private TipoTransacao tipo;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public TipoTransacao getTipo() { return tipo; }
    public void setTipo(TipoTransacao tipo) { this.tipo = tipo; }
}