package com.ifpr.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Relatório de resumo mensal de uma carteira. */
public record RelatorioMensalDTO(
        UUID carteiraId,
        String carteiraNome,
        String mes,                       // "yyyy-MM"
        Instant geradoEm,
        BigDecimal saldoInicial,          // saldo da carteira no início do mês
        BigDecimal totalReceitas,
        BigDecimal totalDespesas,
        BigDecimal resultadoMes,          // receitas - despesas do mês
        BigDecimal saldoFinal,            // saldoInicial + resultadoMes
        long quantidadeTransacoes,
        BigDecimal receitasMesAnterior,   // para comparar com o mês anterior
        BigDecimal despesasMesAnterior,
        List<CategoriaRelatorio> porCategoria,
        List<LancamentoRelatorio> maioresDespesas,
        List<LancamentoRelatorio> lancamentos) {

    /** Total de uma categoria no mês; o percentual é em relação ao total do mesmo tipo. */
    public record CategoriaRelatorio(
            UUID categoriaId,
            String categoria,
            String tipo,
            BigDecimal total,
            long quantidade,
            BigDecimal percentual) {
    }

    public record LancamentoRelatorio(
            UUID id,
            LocalDate data,
            String descricao,
            String categoria,
            String tipo,
            BigDecimal valor,
            String criadoPor) {
    }
}
