package com.ifpr.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.enums.TipoTransacao;

public interface CategoriaRepository extends JpaRepository<Categoria, UUID> {

    @Query("SELECT c FROM Categoria c WHERE c.usuario IS NULL OR c.usuario.id = :usuarioId")
    List<Categoria> findDisponiveisParaUsuario(@Param("usuarioId") UUID usuarioId);

    @Query("SELECT c FROM Categoria c WHERE (c.usuario IS NULL OR c.usuario.id = :usuarioId) AND c.tipo = :tipo")
    List<Categoria> findDisponiveisParaUsuarioETipo(@Param("usuarioId") UUID usuarioId, @Param("tipo") TipoTransacao tipo);
}