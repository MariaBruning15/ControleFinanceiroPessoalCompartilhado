package com.ifpr.backend.controller;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
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

import com.ifpr.backend.dto.DashboardSummaryDTO;
import com.ifpr.backend.dto.TransacaoRequestDTO;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.model.enums.TipoTransacao;
import com.ifpr.backend.service.TransacaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/carteiras/{walletId}/transacoes")
@CrossOrigin(originPatterns = "*")
public class TransacaoController {

    private final TransacaoService transacaoService;

    public TransacaoController(TransacaoService transacaoService) {
        this.transacaoService = transacaoService;
    }

    // 1. Listar transações por carteira com filtros e paginação
    @GetMapping
    public ResponseEntity<Page<Transacao>> listarPorCarteira(
            @PathVariable UUID walletId,
            @RequestHeader("X-Usuario-Id") UUID usuarioId,
            @RequestParam(required = false) TipoTransacao tipo,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {

        Page<Transacao> page = transacaoService.listarPorCarteiraEFiltros(
                walletId, usuarioId, tipo, categoryId, startDate, endDate, pageable);
        return ResponseEntity.ok(page);
    }

    // 2. Detalhar uma transação específica
    @GetMapping("/{id}")
    public ResponseEntity<Transacao> detalharTransacao(
            @PathVariable UUID walletId,
            @PathVariable UUID id,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {

        Transacao transacao = transacaoService.detalharTransacao(walletId, id, usuarioId);
        return ResponseEntity.ok(transacao);
    }

    // 3. Criar transação na carteira
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

    // 4. Atualizar transação da carteira
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

    // 5. Remover transação da carteira
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerTransacao(
            @PathVariable UUID walletId,
            @PathVariable UUID id,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {

        transacaoService.removerTransacao(walletId, id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    // 6. Obter resumo consolidado para a Dashboard
    @GetMapping("/resumo-dashboard")
    public ResponseEntity<DashboardSummaryDTO> obterResumoDashboard(
            @PathVariable UUID walletId,
            @RequestHeader("X-Usuario-Id") UUID usuarioId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        DashboardSummaryDTO summary = transacaoService.obterResumoDashboard(walletId, usuarioId, startDate, endDate);
        return ResponseEntity.ok(summary);
    }
}