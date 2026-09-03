package com.ifpr.backend.controller;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.DashboardSummaryDTO;
import com.ifpr.backend.service.TransacaoService;

@RestController
@RequestMapping("/api/v1/wallets/{walletId}/summary")
public class DashboardController {

    private final TransacaoService transacaoService;

    public DashboardController(TransacaoService transacaoService) {
        this.transacaoService = transacaoService;
    }

    @GetMapping
    public ResponseEntity<DashboardSummaryDTO> obterResumo(
            @PathVariable UUID walletId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {

        DashboardSummaryDTO summary = transacaoService.obterResumoDashboard(walletId, usuarioId, startDate, endDate);
        return ResponseEntity.ok(summary);
    }
}