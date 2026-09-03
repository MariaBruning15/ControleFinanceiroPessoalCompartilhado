package com.ifpr.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.model.enums.PapelCarteira;
import com.ifpr.backend.repository.CarteiraRepository;
import com.ifpr.backend.repository.CategoriaRepository;
import com.ifpr.backend.repository.TransacaoRepository;
import com.ifpr.backend.repository.UsuarioRepository;

@Service
public class TransacaoService {

    private final TransacaoRepository transacaoRepository;
    private final CarteiraRepository carteiraRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final CarteiraService carteiraService;

    public TransacaoService(TransacaoRepository transacaoRepository,
                            CarteiraRepository carteiraRepository,
                            CategoriaRepository categoriaRepository,
                            UsuarioRepository usuarioRepository,
                            CarteiraService carteiraService) {
        this.transacaoRepository = transacaoRepository;
        this.carteiraRepository = carteiraRepository;
        this.categoriaRepository = categoriaRepository;
        this.usuarioRepository = usuarioRepository;
        this.carteiraService = carteiraService;
    }

    @Transactional
    public Transacao criarTransacao(UUID carteiraId, UUID categoriaId, UUID usuarioId, Transacao transacao) {
        // Valida se o usuário tem permissão para editar (DONO ou EDITOR)
        carteiraService.validarPermissao(carteiraId, usuarioId, List.of(PapelCarteira.DONO, PapelCarteira.EDITOR));

        Carteira carteira = carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new IllegalArgumentException("Carteira não encontrada."));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        if (categoriaId != null) {
            Categoria categoria = categoriaRepository.findById(categoriaId)
                    .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada."));
            transacao.setCategoria(categoria);
        }

        transacao.setCarteira(carteira);
        transacao.setCriadoPor(usuario);

        return transacaoRepository.save(transacao);
    }

    public List<Transacao> listarPorCarteira(UUID carteiraId, UUID usuarioId) {
        carteiraService.validarPermissao(carteiraId, usuarioId, List.of(PapelCarteira.DONO, PapelCarteira.EDITOR, PapelCarteira.VISUALIZADOR));
        return transacaoRepository.findByCarteiraIdOrderByDataDesc(carteiraId);
    }

    public List<Transacao> buscarExtratoPorPeriodo(UUID carteiraId, UUID usuarioId, LocalDate inicio, LocalDate fim) {
        carteiraService.validarPermissao(carteiraId, usuarioId, List.of(PapelCarteira.DONO, PapelCarteira.EDITOR, PapelCarteira.VISUALIZADOR));
        return transacaoRepository.findByCarteiraIdAndDataBetweenOrderByDataDesc(carteiraId, inicio, fim);
    }
}