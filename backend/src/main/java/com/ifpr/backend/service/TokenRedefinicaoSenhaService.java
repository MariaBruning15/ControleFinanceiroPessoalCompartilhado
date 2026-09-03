package com.ifpr.backend.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ifpr.backend.model.TokenRedefinicaoSenha;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.repository.TokenRedefinicaoSenhaRepository;
import com.ifpr.backend.repository.UsuarioRepository;

@Service
public class TokenRedefinicaoSenhaService {

    private final TokenRedefinicaoSenhaRepository tokenRepository;
    private final UsuarioRepository usuarioRepository;

    public TokenRedefinicaoSenhaService(TokenRedefinicaoSenhaRepository tokenRepository,
                                        UsuarioRepository usuarioRepository) {
        this.tokenRepository = tokenRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public TokenRedefinicaoSenha criarTokenRecuperacao(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        String tokenUUID = UUID.randomUUID().toString();
        LocalDateTime expiracao = LocalDateTime.now().plusHours(2); // Validade de 2 horas

        TokenRedefinicaoSenha token = new TokenRedefinicaoSenha(usuario, tokenUUID, expiracao);
        return tokenRepository.save(token);
    }

    @Transactional
    public void redefinirSenha(String token, String novaSenha) {
        TokenRedefinicaoSenha tokenEntidade = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token inválido ou inexistente."));

        if (tokenEntidade.isUtilizado()) {
            throw new IllegalArgumentException("Este token já foi utilizado.");
        }

        if (tokenEntidade.isExpirado()) {
            throw new IllegalArgumentException("Este token expirou.");
        }

        Usuario usuario = tokenEntidade.getUsuario();
        usuario.setSenha(novaSenha);
        usuarioRepository.save(usuario);

        tokenEntidade.setUtilizado(true);
        tokenRepository.save(tokenEntidade);
    }
}