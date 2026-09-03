package com.ifpr.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ifpr.backend.model.Usuario;

public class UsuarioResponseDTO {

    private UUID id;
    private String nome;
    private String email;
    private LocalDateTime criadoEm;

    public UsuarioResponseDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.nome = usuario.getNome();
        this.email = usuario.getEmail();
        this.criadoEm = usuario.getCriadoEm();
    }

    public UUID getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
}