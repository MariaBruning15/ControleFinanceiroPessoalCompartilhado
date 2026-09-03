package com.ifpr.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
    public Carteira criarCarteira(Carteira carteira, UUID usuarioDonoId) {
        Usuario dono = usuarioRepository.findById(usuarioDonoId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        Carteira carteiraSalva = carteiraRepository.save(carteira);

        // Define o criador como DONO na tabela pivô
        CarteiraMembro membroDono = new CarteiraMembro(carteiraSalva, dono, PapelCarteira.DONO);
        carteiraMembroRepository.save(membroDono);

        return carteiraSalva;
    }

    public List<Carteira> listarCarteirasDoUsuario(UUID usuarioId) {
        return carteiraRepository.findCarteirasByUsuarioId(usuarioId);
    }

    @Transactional
    public CarteiraMembro adicionarMembro(UUID carteiraId, String emailMembro, PapelCarteira papel, UUID usuarioRequisitanteId) {
        // Apenas o DONO pode adicionar novos membros
        validarPermissao(carteiraId, usuarioRequisitanteId, List.of(PapelCarteira.DONO));

        Carteira carteira = carteiraRepository.findById(carteiraId)
                .orElseThrow(() -> new IllegalArgumentException("Carteira não encontrada."));

        Usuario novoMembro = usuarioRepository.findByEmail(emailMembro)
                .orElseThrow(() -> new IllegalArgumentException("Usuário com este e-mail não encontrado."));

        if (carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, novoMembro.getId()).isPresent()) {
            throw new IllegalArgumentException("Usuário já é membro desta carteira.");
        }

        CarteiraMembro membro = new CarteiraMembro(carteira, novoMembro, papel);
        return carteiraMembroRepository.save(membro);
    }

    public void validarPermissao(UUID carteiraId, UUID usuarioId, List<PapelCarteira> papeisPermitidos) {
        CarteiraMembro membro = carteiraMembroRepository.findByCarteiraIdAndUsuarioId(carteiraId, usuarioId)
                .orElseThrow(() -> new SecurityException("Acesso negado: Usuário não pertence a esta carteira."));

        if (!papeisPermitidos.contains(membro.getPapel())) {
            throw new SecurityException("Acesso negado: Permissão insuficiente para esta operação.");
        }
    }
}