package com.ifpr.backend.dto;

import com.ifpr.backend.model.enums.PapelCarteira;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AdicionarMembroRequestDTO {

    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "E-mail inválido.")
    private String email;

    @NotNull(message = "O papel é obrigatório (DONO, EDITOR, VISUALIZADOR).")
    private PapelCarteira papel;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public PapelCarteira getPapel() { return papel; }
    public void setPapel(PapelCarteira papel) { this.papel = papel; }
}