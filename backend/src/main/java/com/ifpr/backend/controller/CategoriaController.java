package com.ifpr.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.CategoriaRequestDTO;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.service.CategoriaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<Categoria>> listarDisponiveis(@RequestHeader("X-Usuario-Id") UUID usuarioId) {
        List<Categoria> categorias = categoriaService.listarCategoriasPorUsuario(usuarioId);
        return ResponseEntity.ok(categorias);
    }

    @PostMapping
    public ResponseEntity<Categoria> criarPersonalizada(@Valid @RequestBody CategoriaRequestDTO dto,
                                                       @RequestHeader("X-Usuario-Id") UUID usuarioId) {
        Categoria categoria = new Categoria(dto.getNome(), dto.getTipo(), null);
        Categoria salva = categoriaService.criarCategoriaPersonalizada(categoria, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }
}