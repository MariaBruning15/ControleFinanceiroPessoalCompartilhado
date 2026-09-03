package com.ifpr.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.EsqueciSenhaRequestDTO;
import com.ifpr.backend.dto.RedefinirSenhaRequestDTO;
import com.ifpr.backend.model.TokenRedefinicaoSenha;
import com.ifpr.backend.service.TokenRedefinicaoSenhaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/senha")
public class SenhaController {

    private final TokenRedefinicaoSenhaService tokenService;

    public SenhaController(TokenRedefinicaoSenhaService tokenService) {
        this.tokenService = tokenService;
    }

    @PostMapping("/esqueci-senha")
    public ResponseEntity<String> solicitarRecuperacao(@Valid @RequestBody EsqueciSenhaRequestDTO dto) {
        TokenRedefinicaoSenha token = tokenService.criarTokenRecuperacao(dto.getEmail());
        // Em produção enviaria um e-mail. Para fins do projeto, é retornado o token na resposta.
        return ResponseEntity.ok("Token de redefinição gerado com sucesso: " + token.getToken());
    }

    @PostMapping("/redefinir")
    public ResponseEntity<String> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequestDTO dto) {
        tokenService.redefinirSenha(dto.getToken(), dto.getNovaSenha());
        return ResponseEntity.ok("Senha alterada com sucesso.");
    }
}