package com.ifpr.backend.controller;

import java.util.List;
import java.util.UUID;

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

import com.ifpr.backend.dto.CategoriaRequestDTO;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.enums.TipoTransacao;
import com.ifpr.backend.service.CategoriaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    // GET /api/v1/categories?type=INCOME ou ?type=EXPENSE
    @GetMapping
    public ResponseEntity<List<Categoria>> listarCategorias(
            @RequestHeader("X-Usuario-Id") UUID usuarioId,
            @RequestParam(value = "type", required = false) TipoTransacao tipo) {
        List<Categoria> categorias = categoriaService.listarCategorias(usuarioId, tipo);
        return ResponseEntity.ok(categorias);
    }

    @PostMapping
    public ResponseEntity<Categoria> criarCategoria(
            @Valid @RequestBody CategoriaRequestDTO dto,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        Categoria categoria = new Categoria(dto.getNome(), dto.getTipo(), null);
        Categoria salva = categoriaService.criarCategoria(categoria, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> atualizarCategoria(
            @PathVariable UUID id,
            @Valid @RequestBody CategoriaRequestDTO dto,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        Categoria dados = new Categoria(dto.getNome(), dto.getTipo(), null);
        Categoria atualizada = categoriaService.atualizarCategoria(id, dados, usuarioId);
        return ResponseEntity.ok(atualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerCategoria(@PathVariable UUID id) {
        categoriaService.removerCategoria(id);
        return ResponseEntity.noContent().build();
    }
}