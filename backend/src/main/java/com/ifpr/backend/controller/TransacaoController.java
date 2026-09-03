package com.ifpr.backend.controller;

import com.ifpr.backend.dto.TransacaoRequestDTO;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.service.TransacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wallets/{walletId}/transactions")
public class TransacaoController {

    private final TransacaoService transacaoService;

    public TransacaoController(TransacaoService transacaoService) {
        this.transacaoService = transacaoService;
    }

    @PostMapping
    public ResponseEntity<Transacao> criarTransacao(
            @PathVariable UUID walletId,
            @Valid @RequestBody TransacaoRequestDTO dto,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {

        Transacao transacao = new Transacao();
        transacao.setTipo(dto.getTipo());
        transacao.setValor(dto.getValor());
        transacao.setDescricao(dto.getDescricao());
        transacao.setData(dto.getData());

        Transacao salva = transacaoService.criarTransacao(walletId, dto.getCategoriaId(), usuarioId, transacao);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transacao> atualizarTransacao(
            @PathVariable UUID walletId,
            @PathVariable UUID id,
            @Valid @RequestBody TransacaoRequestDTO dto,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {

        Transacao dados = new Transacao();
        dados.setTipo(dto.getTipo());
        dados.setValor(dto.getValor());
        dados.setDescricao(dto.getDescricao());
        dados.setData(dto.getData());

        Transacao atualizada = transacaoService.atualizarTransacao(walletId, id, dto.getCategoriaId(), usuarioId, dados);
        return ResponseEntity.ok(atualizada);
    }
}