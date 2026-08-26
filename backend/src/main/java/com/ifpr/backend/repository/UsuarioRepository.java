package com.ifpr.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ifpr.backend.model.Usuario;


public interface UsuarioRepository extends JpaRepository<Usuario, Long>{

}