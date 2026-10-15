package com.ifpr.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.EsqueciSenhaRequestDTO;
import com.ifpr.backend.dto.RedefinirSenhaRequestDTO;
import com.ifpr.backend.model.TokenRedefinicaoSenha;
import com.ifpr.backend.service.EmailService;
import com.ifpr.backend.service.TokenRedefinicaoSenhaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/senha")
public class SenhaController {

    private final TokenRedefinicaoSenhaService tokenService;
    private final EmailService emailService;

    public SenhaController(TokenRedefinicaoSenhaService tokenService, EmailService emailService) {
         this.tokenService = tokenService;
        this.emailService = emailService;
    }

    @PostMapping("/esqueci-senha")
public ResponseEntity<String> solicitarRecuperacao(@Valid @RequestBody EsqueciSenhaRequestDTO dto) {
    TokenRedefinicaoSenha token = tokenService.criarTokenRecuperacao(dto.getEmail());
    emailService.enviarRecuperacaoSenha(dto.getEmail(), token.getToken());
    return ResponseEntity.ok("Se o e-mail estiver cadastrado, você receberá as instruções.");
}

    @PostMapping("/redefinir")
    public ResponseEntity<String> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequestDTO dto) {
        tokenService.redefinirSenha(dto.getToken(), dto.getNovaSenha());
        return ResponseEntity.ok("Senha alterada com sucesso.");
    }
}