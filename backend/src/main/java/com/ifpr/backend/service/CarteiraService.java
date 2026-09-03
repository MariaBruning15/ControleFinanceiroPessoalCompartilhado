package com.ifpr.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ifpr.backend.exception.AcessoNegadoException;
import com.ifpr.backend.exception.RecursoJaExisteException;
import com.ifpr.backend.exception.ResourceNotFoundException;
import com.ifpr.backend.model.Carteira;
import com.ifpr.backend.model.CarteiraMembro;
import com.ifpr.backend.model.Usuario;
import com.ifpr.backend.model.enums.PapelCarteira;
import com.ifpr.backend.repository.CarteiraMembroRepository;
import com.ifpr.backend.repository.CarteiraRepository;
import com.ifpr.backend.repository.UsuarioRepository;

@Service
public class CarteiraService {

    private final CarteiraRepository carteiraRepository;
    private final CarteiraMembroRepository carteiraMembroRepository;
    private final UsuarioRepository usuarioRepository;

    public CarteiraService(CarteiraRepository carteiraRepository,
                           CarteiraMembroRepository carteiraMembroRepository,
                           UsuarioRepository usuarioRepository) {
        this.carteiraRepository = carteiraRepository;
        this.carteiraMembroRepository = carteiraMembroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Carteira> listarCarteirasDoUsuario(UUID usuarioId) {
        return carteiraRepository.findCarteirasByUsuarioId(usuarioId);
    }

    @Transactional
    public Carteira criarCarteira(Carteira carteira, UUID usuarioDonoId) {
        Usuario dono = usuarioRepository.findById(usuarioDonoId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        Carteira carteiraSalva = carteiraRepository.save(carteira);
        CarteiraMembro membroDono = new CarteiraMembro(carteiraSalva, dono, PapelCarteira.DONO);
        carteiraMembroRepository.save(membroDono);

        return carteiraSalva;
    }

    public Carteira detalharCarteira(UUID carteiraId, UUID usuarioId) {
        validarMembro(carteiraId, usuarioId);
        return carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada."));
    }

    @Transactional
    public Carteira atualizarCarteira(UUID carteiraId, Carteira dados, UUID usuarioId) {
        validarPermissao(carteiraId, usuarioId, List.of(PapelCarteira.DONO)); // Somente OWNER[cite: 2]
        Carteira carteira = carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada."));

        carteira.setNome(dados.getNome());
        carteira.setDescricao(dados.getDescricao());
        return carteiraRepository.save(carteira);
    }

    @Transactional
    public void removerCarteira(UUID carteiraId, UUID usuarioId) {
        validarPermissao(carteiraId, usuarioId, List.of(PapelCarteira.DONO)); // Somente OWNER[cite: 2]
        Carteira carteira = carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada."));
        carteiraRepository.delete(carteira);
    }


    public List<CarteiraMembro> listarMembros(UUID carteiraId, UUID usuarioId) {
        validarMembro(carteiraId, usuarioId);
        return carteiraMembroRepository.findByCarteiraId(carteiraId);
    }

    @Transactional
    public CarteiraMembro adicionarMembro(UUID carteiraId, String emailMembro, PapelCarteira papel, UUID usuarioRequisitanteId) {
        validarPermissao(carteiraId, usuarioRequisitanteId, List.of(PapelCarteira.DONO)); // Somente OWNER (403 se falhar)[cite: 2]

        Carteira carteira = carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new ResourceNotFoundException("Carteira não encontrada."));

        Usuario novoMembro = usuarioRepository.findByEmail(emailMembro)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com o e-mail informado não foi encontrado.")); // HTTP 404

        if (carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, novoMembro.getId()).isPresent()) {
            throw new RecursoJaExisteException("Este usuário já é membro da carteira."); // HTTP 409
        }

        CarteiraMembro membro = new CarteiraMembro(carteira, novoMembro, papel);
        return carteiraMembroRepository.save(membro);
    }

    @Transactional
    public CarteiraMembro alterarPapelMembro(UUID carteiraId, UUID targetUserId, PapelCarteira novoPapel, UUID usuarioRequisitanteId) {
        validarPermissao(carteiraId, usuarioRequisitanteId, List.of(PapelCarteira.DONO)); // Somente OWNER[cite: 2]

        CarteiraMembro membro = carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Membro não encontrado nesta carteira."));

        membro.setPapel(novoPapel);
        return carteiraMembroRepository.save(membro);
    }

    @Transactional
    public void removerMembro(UUID carteiraId, UUID targetUserId, UUID usuarioRequisitanteId) {
        validarPermissao(carteiraId, usuarioRequisitanteId, List.of(PapelCarteira.DONO)); // Somente OWNER[cite: 2]

        CarteiraMembro membro = carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Membro não encontrado nesta carteira."));

        carteiraMembroRepository.delete(membro);
    }

    public void validarMembro(UUID carteiraId, UUID usuarioId) {
        carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, usuarioId)
                .orElseThrow(() -> new AcessoNegadoException("Acesso negado: Você não é membro desta carteira."));
    }

    public void validarPermissao(UUID carteiraId, UUID usuarioId, List<PapelCarteira> papeisPermitidos) {
        CarteiraMembro membro = carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, usuarioId)
                .orElseThrow(() -> new AcessoNegadoException("Acesso negado: Você não é membro desta carteira."));

        if (!papeisPermitidos.contains(membro.getPapel())) {
            throw new AcessoNegadoException("Acesso negado: Somente o OWNER pode realizar esta operação.");
        }
    }
}