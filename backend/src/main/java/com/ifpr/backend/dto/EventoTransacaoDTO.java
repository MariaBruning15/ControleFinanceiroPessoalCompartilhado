package com.ifpr.backend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Atividade feita por um membro na carteira (evento SSE "transacao"). */
public record EventoTransacaoDTO(
        String acao,          // CRIADA, ATUALIZADA ou REMOVIDA
        String tipo,          // RECEITA ou DESPESA
        String descricao,
        BigDecimal valor,
        LocalDate data,
        UUID usuarioId,       // quem fez a ação
        String usuarioNome,
        Instant ocorridoEm) {
}
