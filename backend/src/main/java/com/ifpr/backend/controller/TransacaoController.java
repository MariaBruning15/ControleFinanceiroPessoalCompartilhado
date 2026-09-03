package com.ifpr.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.TransacaoRequestDTO;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.service.TransacaoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/transacoes")
public class TransacaoController {

    private final TransacaoService transacaoService;

    public TransacaoController(TransacaoService transacaoService) {
        this.transacaoService = transacaoService;
    }

    @PostMapping
    public ResponseEntity<Transacao> criarTransacao(@Valid @RequestBody TransacaoRequestDTO dto,
                                                   @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        Transacao transacao = new Transacao();
        transacao.setTipo(dto.getTipo());
        transacao.setValor(dto.getValor());
        transacao.setDescricao(dto.getDescricao());
        transacao.setData(dto.getData());

        Transacao salva = transacaoService.criarTransacao(dto.getCarteiraId(), dto.getCategoriaId(), usuarioId, transacao);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @GetMapping("/carteira/{carteiraId}")
    public ResponseEntity<List<Transacao>> listarPorCarteira(@PathVariable UUID carteiraId,
                                                             @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        List<Transacao> transacoes = transacaoService.listarPorCarteira(carteiraId, usuarioId);
        return ResponseEntity.ok(transacoes);
    }

    @GetMapping("/carteira/{carteiraId}/extrato")
    public ResponseEntity<List<Transacao>> extratoPorPeriodo(@PathVariable UUID carteiraId,
                                                             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
                                                             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim,
                                                             @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        List<Transacao> extrato = transacaoService.buscarExtratoPorPeriodo(carteiraId, usuarioId, inicio, fim);
        return ResponseEntity.ok(extrato);
    }
}