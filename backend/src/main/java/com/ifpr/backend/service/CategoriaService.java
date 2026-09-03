package com.ifpr.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ifpr.backend.exception.CategoriaTransacoesException;
import com.ifpr.backend.exception.ResourceNotFoundException;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.model.enums.TipoTransacao;
import com.ifpr.backend.repository.CategoriaRepository;
import com.ifpr.backend.repository.TransacaoRepository;
import com.ifpr.backend.repository.UsuarioRepository;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final TransacaoRepository transacaoRepository;
    private final UsuarioRepository usuarioRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, 
                            TransacaoRepository transacaoRepository, 
                            UsuarioRepository usuarioRepository) {
        this.categoriaRepository = categoriaRepository;
        this.transacaoRepository = transacaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Categoria> listarCategorias(UUID usuarioId, TipoTransacao tipo) {
        if (tipo != null) {
            return categoriaRepository.findDisponiveisParaUsuarioETipo(usuarioId, tipo);
        }
        return categoriaRepository.findDisponiveisParaUsuario(usuarioId);
    }

    @Transactional
    public Categoria criarCategoria(Categoria categoria, UUID usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        categoria.setUsuario(usuario);
        return categoriaRepository.save(categoria);
    }

    @Transactional
    public Categoria atualizarCategoria(UUID id, Categoria dadosAtualizados, UUID usuarioId) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));

        categoria.setNome(dadosAtualizados.getNome());
        categoria.setTipo(dadosAtualizados.getTipo());

        return categoriaRepository.save(categoria);
    }

    @Transactional
    public void removerCategoria(UUID id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));

        if (transacaoRepository.existsByCategoriaId(id)) {
            throw new CategoriaTransacoesException("Não é possível excluir uma categoria que possui transações vinculadas.");
        }

        categoriaRepository.delete(categoria);
    }
}