package com.ifpr.backend.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ifpr.backend.exception.RegraNegocioException;
import com.ifpr.backend.exception.ResourceNotFoundException;
import com.ifpr.backend.exception.SenhaIncorretaException;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.repository.UsuarioRepository;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public Usuario cadastrar(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new RegraNegocioException("E-mail já cadastrado no sistema.");
        }
        return usuarioRepository.save(usuario);
    }

    public Usuario buscarPorId(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com o ID fornecido."));
    }

    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com o e-mail fornecido."));
    }

    @Transactional
    public Usuario atualizarPerfil(UUID usuarioId, String novoNome) {
        Usuario usuario = buscarPorId(usuarioId);
        usuario.setNome(novoNome);
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void alterarSenha(UUID usuarioId, String senhaAtual, String novaSenha) {
        Usuario usuario = buscarPorId(usuarioId);

        if (!usuario.getSenha().equals(senhaAtual)) {
            throw new SenhaIncorretaException("A senha atual está incorreta.");
        }

        usuario.setSenha(novaSenha);
        usuarioRepository.save(usuario);
    }
}