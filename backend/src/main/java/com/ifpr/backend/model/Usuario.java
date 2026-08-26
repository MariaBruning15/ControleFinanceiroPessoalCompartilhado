package com.ifpr.backend.model;



import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.Setter;

@Entity
@Data

public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "Nome obrigatório")
    @Size(min =10, message = "Insira um nome completo")
    private String nome;

    @Email(message = "Insira um email valido")
    private String email;
    private String senha;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    //Cascade: todas as informações do crud são automaticamentes salvas em UsiarioPerfil
    //orphanRemoval: sempre que um usuario for removido o UsuarioPerfil é removido tambem
    @Setter(value = AccessLevel.NONE)
    private List<UsuarioPerfil> usuarioPerfil;


    public void setUsuarioPerfil(List<UsuarioPerfil> usuariosPerfils){
        if(usuariosPerfils!=null){
            for(UsuarioPerfil u:usuariosPerfils){
                u.setUsuario(this);
            }
        }
        this.usuarioPerfil = usuariosPerfils;
    }
}