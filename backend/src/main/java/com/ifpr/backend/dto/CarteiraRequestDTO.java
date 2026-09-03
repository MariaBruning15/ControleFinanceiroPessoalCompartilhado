package com.ifpr.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;

public class CarteiraRequestDTO {

    @NotBlank(message = "O nome da carteira é obrigatório.")
    private String nome;

    private String descricao;
    private BigDecimal saldoInicial;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public BigDecimal getSaldoInicial() { return saldoInicial; }
    public void setSaldoInicial(BigDecimal saldoInicial) { this.saldoInicial = saldoInicial; }
}