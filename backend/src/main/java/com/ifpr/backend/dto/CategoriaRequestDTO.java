package com.ifpr.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CategoriaRequestDTO {

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotNull(message = "O tipo é obrigatório")
    private String tipo;

    public CategoriaRequestDTO() {
    }

    public CategoriaRequestDTO(String nome, String tipo) {
        this.nome = nome;
        this.tipo = tipo;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
}