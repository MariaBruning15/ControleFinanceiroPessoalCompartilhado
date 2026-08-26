package com.ifpr.backend.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ifpr.backend.model.Perfil;


public interface PerfilRepository extends JpaRepository<Perfil, UUID>{

}