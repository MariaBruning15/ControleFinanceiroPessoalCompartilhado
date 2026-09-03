package com.ifpr.backend.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.AlterarSenhaRequestDTO;
import com.ifpr.backend.dto.AtualizarUsuarioRequestDTO;
import com.ifpr.backend.dto.UsuarioRequestDTO;
import com.ifpr.backend.dto.UsuarioResponseDTO;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> cadastrar(@Valid @RequestBody UsuarioRequestDTO dto) {
        Usuario usuario = new Usuario(dto.getNome(), dto.getEmail(), dto.getSenha());
        Usuario salvo = usuarioService.cadastrar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(new UsuarioResponseDTO(salvo));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> me(@RequestHeader("X-Usuario-Id") UUID usuarioId) {
        Usuario usuario = usuarioService.buscarPorId(usuarioId);
        return ResponseEntity.ok(new UsuarioResponseDTO(usuario));
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> atualizarPerfil(@RequestHeader("X-Usuario-Id") UUID usuarioId,
                                                             @Valid @RequestBody AtualizarUsuarioRequestDTO dto) {
        Usuario atualizado = usuarioService.atualizarPerfil(usuarioId, dto.getNome());
        return ResponseEntity.ok(new UsuarioResponseDTO(atualizado));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Map<String, String>> alterarSenha(@RequestHeader("X-Usuario-Id") UUID usuarioId,
                                                            @Valid @RequestBody AlterarSenhaRequestDTO dto) {
        usuarioService.alterarSenha(usuarioId, dto.getCurrentPassword(), dto.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Senha alterada com sucesso."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable UUID id) {
        Usuario usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.ok(new UsuarioResponseDTO(usuario));
    }
}