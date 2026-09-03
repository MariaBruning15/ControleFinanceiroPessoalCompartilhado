package com.ifpr.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ifpr.backend.model.Carteira;

public interface CarteiraRepository extends JpaRepository<Carteira, UUID> {

    @Query("SELECT cm.carteira FROM CarteiraMembro cm WHERE cm.usuario.id = :usuarioId")
    List<Carteira> findCarteirasByUsuarioId(@Param("usuarioId") UUID usuarioId);
}