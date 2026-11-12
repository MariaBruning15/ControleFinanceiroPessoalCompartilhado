package com.ifpr.backend.controller;

import java.time.YearMonth;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.RelatorioMensalDTO;
import com.ifpr.backend.service.RelatorioService;

@RestController
@RequestMapping("/carteiras/{carteiraId}/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    /** Resumo mensal. Ex.: GET /carteiras/{id}/relatorios/mensal?mes=2026-11 (sem "mes" = mês atual). */
    @GetMapping("/mensal")
    public ResponseEntity<RelatorioMensalDTO> resumoMensal(
            @PathVariable("carteiraId") UUID carteiraId,
            @RequestParam(value = "mes", required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth mes,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {

        YearMonth alvo = mes != null ? mes : YearMonth.now();
        return ResponseEntity.ok(relatorioService.gerarResumoMensal(carteiraId, usuarioId, alvo));
    }
}
