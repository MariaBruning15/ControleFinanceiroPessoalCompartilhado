package com.ifpr.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ifpr.backend.exception.ResourceNotFoundException;
import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.Categoria;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.model.enums.PapelCarteira;
import com.ifpr.backend.model.enums.TipoTransacao;
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

    public Page<Transacao> listarPorCarteiraEFiltros(UUID carteiraId, UUID usuarioId, TipoTransacao tipo,
                                                     UUID categoryId, LocalDate startDate, LocalDate endDate,
                                                     Pageable pageable) {
        carteiraService.validarMembro(carteiraId, usuarioId);
        return transacaoRepository.findComFiltrosEPaginacao(carteiraId, tipo, categoryId, startDate, endDate, pageable);
    }

    public Transacao detalharTransacao(UUID carteiraId, UUID transacaoId, UUID usuarioId) {
        carteiraService.validarMembro(carteiraId, usuarioId);
        return transacaoRepository.findByIdAndCarteiraId(transacaoId, carteiraId)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada nesta carteira."));
    }

    @Transactional
    public Transacao criarTransacao(UUID carteiraId, UUID categoryId, UUID usuarioId, Transacao transacao) {
        carteiraService.validarPermissao(carteiraId, usuarioId, List.of(PapelCarteira.DONO, PapelCarteira.EDITOR));

        Carteira carteira = carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada."));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (categoryId != null) {
            Categoria categoria = categoriaRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));
            transacao.setCategoria(categoria);
        }

        transacao.setCarteira(carteira);
        transacao.setCriadoPor(usuario);

        return transacaoRepository.save(transacao);
    }

    @Transactional
    public Transacao atualizarTransacao(UUID carteiraId, UUID transacaoId, UUID categoryId, UUID usuarioId, Transacao dados) {
        carteiraService.validarPermissao(carteiraId, usuarioId, List.of(PapelCarteira.DONO, PapelCarteira.EDITOR));

        Transacao transacao = transacaoRepository.findByIdAndCarteiraId(transacaoId, carteiraId)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada nesta carteira."));

        if (categoryId != null) {
            Categoria categoria = categoriaRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada."));
            transacao.setCategoria(categoria);
        } else {
            transacao.setCategoria(null);
        }

        transacao.setTipo(dados.getTipo());
        transacao.setValor(dados.getValor());
        transacao.setDescricao(dados.getDescricao());
        transacao.setData(dados.getData());

        return transacaoRepository.save(transacao);
    }

    @Transactional
    public void removerTransacao(UUID carteiraId, UUID transacaoId, UUID usuarioId) {
        carteiraService.validarPermissao(carteiraId, usuarioId, List.of(PapelCarteira.DONO, PapelCarteira.EDITOR));

        Transacao transacao = transacaoRepository.findByIdAndCarteiraId(transacaoId, carteiraId)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada nesta carteira."));

        transacaoRepository.delete(transacao);
    }
}