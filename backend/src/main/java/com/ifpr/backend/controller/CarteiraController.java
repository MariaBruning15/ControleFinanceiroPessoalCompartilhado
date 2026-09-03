package com.ifpr.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.AdicionarMembroRequestDTO;
import com.ifpr.backend.dto.AlterarPapelRequestDTO;
import com.ifpr.backend.dto.CarteiraRequestDTO;
import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.CarteiraMembro;
import com.ifpr.backend.service.CarteiraService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/wallets")
public class CarteiraController {

    private final CarteiraService carteiraService;

    public CarteiraController(CarteiraService carteiraService) {
        this.carteiraService = carteiraService;
    }

    @GetMapping
    public ResponseEntity<List<Carteira>> listar(@RequestHeader("X-Usuario-Id") UUID usuarioId) {
        return ResponseEntity.ok(carteiraService.listarCarteirasDoUsuario(usuarioId));
    }

    @PostMapping
    public ResponseEntity<Carteira> criar(@Valid @RequestBody CarteiraRequestDTO dto,
                                         @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        Carteira carteira = new Carteira(dto.getNome(), dto.getDescricao(), dto.getSaldoInicial());
        return ResponseEntity.status(HttpStatus.CREATED).body(carteiraService.criarCarteira(carteira, usuarioId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Carteira> detalhar(@PathVariable UUID id,
                                             @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        return ResponseEntity.ok(carteiraService.detalharCarteira(id, usuarioId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Carteira> atualizar(@PathVariable UUID id,
                                              @Valid @RequestBody CarteiraRequestDTO dto,
                                              @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        Carteira dados = new Carteira(dto.getNome(), dto.getDescricao(), dto.getSaldoInicial());
        return ResponseEntity.ok(carteiraService.atualizarCarteira(id, dados, usuarioId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable UUID id,
                                        @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        carteiraService.removerCarteira(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    // 5.5 WALLET MEMBERS

    @GetMapping("/{id}/members")
    public ResponseEntity<List<CarteiraMembro>> listarMembros(@PathVariable UUID id,
                                                              @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        return ResponseEntity.ok(carteiraService.listarMembros(id, usuarioId));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<CarteiraMembro> adicionarMembro(@PathVariable UUID id,
                                                          @Valid @RequestBody AdicionarMembroRequestDTO dto,
                                                          @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        CarteiraMembro novoMembro = carteiraService.adicionarMembro(id, dto.getEmail(), dto.getPapel(), usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoMembro);
    }

    @PatchMapping("/{id}/members/{userId}")
    public ResponseEntity<CarteiraMembro> alterarPapelMembro(@PathVariable UUID id,
                                                            @PathVariable UUID userId,
                                                            @Valid @RequestBody AlterarPapelRequestDTO dto,
                                                            @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        CarteiraMembro atualizado = carteiraService.alterarPapelMembro(id, userId, dto.getPapel(), usuarioId);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removerMembro(@PathVariable UUID id,
                                              @PathVariable UUID userId,
                                              @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        carteiraService.removerMembro(id, userId, usuarioId);
        return ResponseEntity.noContent().build();
    }
}