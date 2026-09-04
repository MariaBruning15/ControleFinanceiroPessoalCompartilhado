package com.ifpr.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.dto.UsuarioRequestDTO;
import com.ifpr.backend.dto.UsuarioResponseDTO;
import com.ifpr.backend.exception.SenhaIncorretaException;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.service.UsuarioService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(originPatterns = "*") 

public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/register")
    public ResponseEntity<UsuarioResponseDTO> registrar(@Valid @RequestBody UsuarioRequestDTO dto) {
        Usuario usuario = new Usuario(dto.getNome(), dto.getEmail(), dto.getSenha());
        Usuario salvo = usuarioService.cadastrar(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(new UsuarioResponseDTO(salvo));
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioResponseDTO> login(@RequestBody Usuario usuario) {
        Usuario encontrado = usuarioService.buscarPorEmail(usuario.getEmail());

        if (!encontrado.getSenha().equals(usuario.getSenha())) {
            throw new SenhaIncorretaException("E-mail ou senha inválidos.");
        }

        return ResponseEntity.ok(new UsuarioResponseDTO(encontrado));
    }
}