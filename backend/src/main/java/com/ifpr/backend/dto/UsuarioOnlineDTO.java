package com.ifpr.backend.dto;

import java.util.UUID;

/** Membro que está com a carteira aberta agora (evento SSE "presenca"). */
public record UsuarioOnlineDTO(UUID usuarioId, String nome) {
}
