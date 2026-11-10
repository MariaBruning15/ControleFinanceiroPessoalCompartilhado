package com.ifpr.backend.controller;

import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.ifpr.backend.service.CarteiraEventosService;

@RestController
@RequestMapping("/carteiras/{walletId}/eventos")
public class CarteiraEventosController {

    private final CarteiraEventosService eventosService;

    public CarteiraEventosController(CarteiraEventosService eventosService) {
        this.eventosService = eventosService;
    }

    /**
     * Canal SSE da carteira. O EventSource do navegador não permite enviar cabeçalhos
     * personalizados, por isso o id do usuário vai como parâmetro (o backend confere
     * se ele é membro da carteira).
     */
    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter assinar(@PathVariable UUID walletId, @RequestParam UUID usuarioId) {
        return eventosService.inscrever(walletId, usuarioId);
    }
}
