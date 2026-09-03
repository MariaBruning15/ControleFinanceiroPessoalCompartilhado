package com.ifpr.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class AtualizarUsuarioRequestDTO {

    @NotBlank(message = "O nome não pode estar em branco.")
    private String nome;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}