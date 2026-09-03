package com.ifpr.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.AdicionarMembroRequestDTO;
import com.ifpr.backend.dto.CarteiraRequestDTO;
import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.CarteiraMembro;
import com.ifpr.backend.service.CarteiraService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/carteiras")
public class CarteiraController {

    private final CarteiraService carteiraService;

    public CarteiraController(CarteiraService carteiraService) {
        this.carteiraService = carteiraService;
    }

    @PostMapping
    public ResponseEntity<Carteira> criarCarteira(@Valid @RequestBody CarteiraRequestDTO dto,
                                                 @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        Carteira carteira = new Carteira(dto.getNome(), dto.getDescricao(), dto.getSaldoInicial());
        Carteira criada = carteiraService.criarCarteira(carteira, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(criada);
    }

    @GetMapping
    public ResponseEntity<List<Carteira>> listarDoUsuario(@RequestHeader("X-Usuario-Id") UUID usuarioId) {
        List<Carteira> carteiras = carteiraService.listarCarteirasDoUsuario(usuarioId);
        return ResponseEntity.ok(carteiras);
    }

    @PostMapping("/{carteiraId}/membros")
    public ResponseEntity<CarteiraMembro> adicionarMembro(@PathVariable UUID carteiraId,
                                                          @Valid @RequestBody AdicionarMembroRequestDTO dto,
                                                          @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        CarteiraMembro membro = carteiraService.adicionarMembro(carteiraId, dto.getEmail(), dto.getPapel(), usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(membro);
    }
}