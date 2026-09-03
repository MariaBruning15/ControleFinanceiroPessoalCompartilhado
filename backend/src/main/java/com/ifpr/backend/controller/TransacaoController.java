package com.ifpr.backend.controller;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.TransacaoRequestDTO;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.model.enums.TipoTransacao;
import com.ifpr.backend.service.TransacaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/wallets/{walletId}/transactions")
public class TransacaoController {

    private final TransacaoService transacaoService;

    public TransacaoController(TransacaoService transacaoService) {
        this.transacaoService = transacaoService;
    }

    @GetMapping
    public ResponseEntity<Page<Transacao>> listarTransacoes(
            @PathVariable UUID walletId,
            @RequestParam(value = "type", required = false) TipoTransacao type,
            @RequestParam(value = "categoryId", required = false) UUID categoryId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(page = 0, size = 20) Pageable pageable,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {

        Page<Transacao> transacoes = transacaoService.listarPorCarteiraEFiltros(
                walletId, usuarioId, type, categoryId, startDate, endDate, pageable);
        return ResponseEntity.ok(transacoes);
    }

    @PostMapping
    public ResponseEntity<Transacao> criarTransacao(
            @PathVariable UUID walletId,
            @Valid @RequestBody TransacaoRequestDTO dto,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {

        Transacao transacao = new Transacao();
        transacao.setTipo(dto.getType());
        transacao.setValor(dto.getAmount());
        transacao.setDescricao(dto.getDescription());
        transacao.setData(dto.getDate());

        Transacao salva = transacaoService.criarTransacao(walletId, dto.getCategoryId(), usuarioId, transacao);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transacao> detalharTransacao(
            @PathVariable UUID walletId,
            @PathVariable UUID id,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {

        Transacao transacao = transacaoService.detalharTransacao(walletId, id, usuarioId);
        return ResponseEntity.ok(transacao);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transacao> atualizarTransacao(
            @PathVariable UUID walletId,
            @PathVariable UUID id,
            @Valid @RequestBody TransacaoRequestDTO dto,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {

        Transacao dados = new Transacao();
        dados.setTipo(dto.getType());
        dados.setValor(dto.getAmount());
        dados.setDescricao(dto.getDescription());
        dados.setData(dto.getDate());

        Transacao atualizada = transacaoService.atualizarTransacao(walletId, id, dto.getCategoryId(), usuarioId, dados);
        return ResponseEntity.ok(atualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerTransacao(
            @PathVariable UUID walletId,
            @PathVariable UUID id,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {

        transacaoService.removerTransacao(walletId, id, usuarioId);
        return ResponseEntity.noContent().build();
    }
}