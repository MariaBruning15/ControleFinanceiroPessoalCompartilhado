package com.ifpr.backend.controller;

import com.ifpr.backend.dto.CategoriaRequestDTO;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.enums.TipoTransacao;
import com.ifpr.backend.service.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

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
        
        TipoTransacao tipoEnum = TipoTransacao.valueOf(dto.getTipo());
        Categoria categoria = new Categoria(dto.getNome(), tipoEnum, null);
        
        Categoria salva = categoriaService.criarCategoria(categoria, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Categoria> atualizarCategoria(
            @PathVariable UUID id,
            @Valid @RequestBody CategoriaRequestDTO dto,
            @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        
        TipoTransacao tipoEnum = TipoTransacao.valueOf(dto.getTipo());
        Categoria dados = new Categoria(dto.getNome(), tipoEnum, null);
        
        Categoria atualizada = categoriaService.atualizarCategoria(id, dados, usuarioId);
        return ResponseEntity.ok(atualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removerCategoria(@PathVariable UUID id) {
        categoriaService.removerCategoria(id);
        return ResponseEntity.noContent().build();
    }
}