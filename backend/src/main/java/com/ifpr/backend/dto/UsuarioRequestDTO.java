package com.ifpr.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UsuarioRequestDTO {

    @NotBlank(message = "O nome é obrigatório.")
    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres.")
    private String name;

    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "Forneça um endereço de e-mail válido.")
    private String email;

    @NotBlank(message = "A senha é obrigatória.")
    @Size(min = 8, max = 100, message = "A senha deve ter entre 8 e 100 caracteres.")
    private String password;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}