package com.ifpr.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ifpr.backend.model.TokenRedefinicaoSenha;

public interface TokenRedefinicaoSenhaRepository extends JpaRepository<TokenRedefinicaoSenha, UUID> {

    Optional<TokenRedefinicaoSenha> findByToken(String token);
}