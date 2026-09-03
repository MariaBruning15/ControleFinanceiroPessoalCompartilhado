package com.ifpr.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ifpr.backend.dto.DashboardSummaryDTO;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.model.enums.TipoTransacao;

public interface TransacaoRepository extends JpaRepository<Transacao, UUID> {

    @Query("SELECT t FROM Transacao t WHERE t.carteira.id = :carteiraId " +
           "AND (:tipo IS NULL OR t.tipo = :tipo) " +
           "AND (:categoryId IS NULL OR t.categoria.id = :categoryId) " +
           "AND (:startDate IS NULL OR t.data >= :startDate) " +
           "AND (:endDate IS NULL OR t.data <= :endDate)")
    Page<Transacao> findComFiltrosEPaginacao(@Param("carteiraId") UUID carteiraId,
                                             @Param("tipo") TipoTransacao tipo,
                                             @Param("categoryId") UUID categoryId,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate,
                                             Pageable pageable);

    Optional<Transacao> findByIdAndCarteiraId(UUID id, UUID carteiraId);

    boolean existsByCategoriaId(UUID categoriaId);

    @Query("SELECT new com.ifpr.backend.dto.DashboardSummaryDTO$CategorySummaryDTO(" +
           "c.id, c.nome, SUM(t.valor)) " +
           "FROM Transacao t JOIN t.categoria c " +
           "WHERE t.carteira.id = :carteiraId " +
           "AND (:startDate IS NULL OR t.data >= :startDate) " +
           "AND (:endDate IS NULL OR t.data <= :endDate) " +
           "GROUP BY c.id, c.nome")
    List<DashboardSummaryDTO.CategorySummaryDTO> findSummaryByCategory(@Param("carteiraId") UUID carteiraId,
                                                                        @Param("startDate") LocalDate startDate,
                                                                        @Param("endDate") LocalDate endDate);

    // Consulta transações filtradas por período para processar o resumo geral e por mês
    @Query("SELECT t FROM Transacao t WHERE t.carteira.id = :carteiraId " +
           "AND (:startDate IS NULL OR t.data >= :startDate) " +
           "AND (:endDate IS NULL OR t.data <= :endDate)")
    List<Transacao> findTransacoesParaSummary(@Param("carteiraId") UUID carteiraId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);
}