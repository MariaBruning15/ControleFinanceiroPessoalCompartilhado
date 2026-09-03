package com.ifpr.backend.dto;

import com.ifpr.backend.model.enums.PapelCarteira;

import jakarta.validation.constraints.NotNull;

public class AlterarPapelRequestDTO {

    @NotNull(message = "O novo papel é obrigatório.")
    private PapelCarteira papel;

    public PapelCarteira getPapel() { return papel; }
    public void setPapel(PapelCarteira papel) { this.papel = papel; }


}