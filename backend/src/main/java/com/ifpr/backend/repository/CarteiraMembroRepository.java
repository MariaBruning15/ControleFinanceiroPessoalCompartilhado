package com.ifpr.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ifpr.backend.model.CarteiraMembro;
import com.ifpr.backend.model.enums.PapelCarteira;

public interface CarteiraMembroRepository extends JpaRepository<CarteiraMembro, UUID> {

    Optional<CarteiraMembro> findByCarteiraIdAndUsuarioId(UUID carteiraId, UUID usuarioId);

    List<CarteiraMembro> findByCarteiraId(UUID carteiraId);

    boolean existsByCarteiraIdAndUsuarioIdAndPapel(UUID carteiraId, UUID usuarioId, PapelCarteira papel);

    void deleteByCarteiraIdAndUsuarioId(UUID carteiraId, UUID usuarioId);
}