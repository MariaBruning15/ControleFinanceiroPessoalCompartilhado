package com.ifpr.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.ifpr.backend.model.CarteiraMembro;
import com.ifpr.backend.model.enums.PapelCarteira;

/**
 * Representação segura de um membro da carteira.
 * Não expõe a entidade Usuario (que contém a senha).
 */
public record MembroResponseDTO(
        UUID usuarioId,
        String nome,
        String email,
        PapelCarteira papel,
        LocalDateTime adicionadoEm) {

    public static MembroResponseDTO de(CarteiraMembro membro) {
        return new MembroResponseDTO(
                membro.getUsuario().getId(),
                membro.getUsuario().getNome(),
                membro.getUsuario().getEmail(),
                membro.getPapel(),
                membro.getAdicionadoEm());
    }
}
