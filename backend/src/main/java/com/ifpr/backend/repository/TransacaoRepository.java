package com.ifpr.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ifpr.backend.model.Transacao;

public interface TransacaoRepository extends JpaRepository<Transacao, UUID> {

    List<Transacao> findByCarteiraIdOrderByDataDesc(UUID carteiraId);

    List<Transacao> findByCarteiraIdAndDataBetweenOrderByDataDesc(UUID carteiraId, LocalDate dataInicio, LocalDate dataFim);

    List<Transacao> findByCarteiraIdAndCriadoPorId(UUID carteiraId, UUID usuarioId);

    boolean existsByCategoriaId(UUID categoriaId);
}