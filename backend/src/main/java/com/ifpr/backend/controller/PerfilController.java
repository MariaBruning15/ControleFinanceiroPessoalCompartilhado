package com.ifpr.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ifpr.backend.model.Perfil;
import com.ifpr.backend.service.PerfilService;

import jakarta.validation.Valid;



@RestController
@RequestMapping("/perfil")
@CrossOrigin
public class PerfilController {
    
    @Autowired
    private PerfilService service;
    
    @GetMapping
    public ResponseEntity<List<Perfil>> buscarTodos(){
        return ResponseEntity.ok(service.listarTodos());
    }

    @PostMapping
    public ResponseEntity<Perfil> inserir(@RequestBody @Valid Perfil perfil){
        Perfil perfilDB = service.inserir(perfil);
        return ResponseEntity.status(HttpStatus.CREATED).body(perfilDB);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Perfil> buscarPorId(@PathVariable("id") UUID id){
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable("id") UUID id){
        service.remover(id);
        return ResponseEntity.noContent().build();
    }
}
