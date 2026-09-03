package com.ifpr.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CategoriaRequestDTO {

    @NotBlank(message = "O nome da categoria é obrigatório.")
    @Size(max = 80, message = "O nome da categoria deve ter no máximo 80 caracteres.")
    private String name;

    @NotNull(message = "O tipo é obrigatório.")
    @Pattern(regexp = "INCOME|EXPENSE", message = "O tipo deve ser 'INCOME' ou 'EXPENSE'.")
    private String type;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}