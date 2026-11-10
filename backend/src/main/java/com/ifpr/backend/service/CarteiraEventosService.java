package com.ifpr.backend.service;

import java.io.IOException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.ifpr.backend.dto.EventoTransacaoDTO;
import com.ifpr.backend.dto.UsuarioOnlineDTO;
import com.ifpr.backend.exception.ResourceNotFoundException;
import com.ifpr.backend.model.Transacao;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.repository.UsuarioRepository;

/**
 * Tempo real das carteiras via Server-Sent Events (SSE).
 *
 * Cada membro com a carteira aberta mantém uma conexão SSE. Dois eventos são enviados:
 *  - "presenca":  lista de membros online na carteira (muda quando alguém entra/sai)
 *  - "transacao": atividade de um membro (transação criada, editada ou removida)
 */
@Service
public class CarteiraEventosService {

    private static final long TIMEOUT_MS = 30L * 60 * 1000; // o navegador reconecta sozinho

    private record Conexao(UUID usuarioId, String nome, SseEmitter emitter) {
    }

    private final Map<UUID, List<Conexao>> conexoesPorCarteira = new ConcurrentHashMap<>();

    private final CarteiraService carteiraService;
    private final UsuarioRepository usuarioRepository;

    public CarteiraEventosService(CarteiraService carteiraService, UsuarioRepository usuarioRepository) {
        this.carteiraService = carteiraService;
        this.usuarioRepository = usuarioRepository;
    }

    /** Abre a conexão SSE de um membro com a carteira (só membros podem assistir). */
    public SseEmitter inscrever(UUID carteiraId, UUID usuarioId) {
        carteiraService.validarMembro(carteiraId, usuarioId);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        SseEmitter emitter = new SseEmitter(TIMEOUT_MS);
        Conexao conexao = new Conexao(usuarioId, usuario.getNome(), emitter);

        conexoesPorCarteira.computeIfAbsent(carteiraId, k -> new CopyOnWriteArrayList<>()).add(conexao);

        emitter.onCompletion(() -> remover(carteiraId, conexao));
        emitter.onTimeout(emitter::complete);
        emitter.onError(e -> remover(carteiraId, conexao));

        // Primeiro evento: confirma a conexão e entrega a lista de quem está online
        if (!enviar(conexao, "presenca", listarOnline(carteiraId))) {
            remover(carteiraId, conexao);
        } else {
            transmitirPresenca(carteiraId);
        }

        return emitter;
    }

    /** Avisa os membros conectados sobre uma ação em transação (envia só depois do commit). */
    public void publicarTransacao(UUID carteiraId, String acao, Transacao transacao, UUID atorId) {
        String atorNome = usuarioRepository.findById(atorId).map(Usuario::getNome).orElse("Alguém");

        EventoTransacaoDTO evento = new EventoTransacaoDTO(
                acao,
                transacao.getTipo() != null ? transacao.getTipo().name() : null,
                transacao.getDescricao(),
                transacao.getValor(),
                transacao.getData(),
                atorId,
                atorNome,
                Instant.now());

        Runnable envio = () -> transmitir(carteiraId, "transacao", evento);

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    envio.run();
                }
            });
        } else {
            envio.run();
        }
    }

    /** Mantém as conexões vivas e descobre as que caíram (navegador fechado, rede perdida...). */
    @Scheduled(fixedRate = 20000)
    public void heartbeat() {
        conexoesPorCarteira.forEach((carteiraId, conexoes) -> {
            for (Conexao conexao : conexoes) {
                try {
                    conexao.emitter().send(SseEmitter.event().comment("ping"));
                } catch (IOException | IllegalStateException e) {
                    remover(carteiraId, conexao);
                }
            }
        });
    }

    // ---------- internos

    private void remover(UUID carteiraId, Conexao conexao) {
        List<Conexao> conexoes = conexoesPorCarteira.get(carteiraId);
        if (conexoes == null || !conexoes.remove(conexao)) {
            return; // já tinha sido removida
        }
        if (conexoes.isEmpty()) {
            conexoesPorCarteira.remove(carteiraId, conexoes);
        } else {
            transmitirPresenca(carteiraId);
        }
    }

    private List<UsuarioOnlineDTO> listarOnline(UUID carteiraId) {
        // Um mesmo usuário com várias abas abertas aparece uma vez só
        Map<UUID, String> unicos = new LinkedHashMap<>();
        for (Conexao c : conexoesPorCarteira.getOrDefault(carteiraId, List.of())) {
            unicos.putIfAbsent(c.usuarioId(), c.nome());
        }
        return unicos.entrySet().stream()
                .map(e -> new UsuarioOnlineDTO(e.getKey(), e.getValue()))
                .toList();
    }

    private void transmitirPresenca(UUID carteiraId) {
        transmitir(carteiraId, "presenca", listarOnline(carteiraId));
    }

    private void transmitir(UUID carteiraId, String evento, Object dados) {
        for (Conexao conexao : conexoesPorCarteira.getOrDefault(carteiraId, List.of())) {
            if (!enviar(conexao, evento, dados)) {
                remover(carteiraId, conexao);
            }
        }
    }

    private boolean enviar(Conexao conexao, String evento, Object dados) {
        try {
            conexao.emitter().send(SseEmitter.event().name(evento).data(dados, MediaType.APPLICATION_JSON));
            return true;
        } catch (IOException | IllegalStateException e) {
            return false;
        }
    }
}
