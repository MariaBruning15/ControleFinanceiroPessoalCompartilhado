import { useState, useEffect, useRef } from 'react';
import carteiraService from '../services/CarteiraService';

/**
 * Conecta ao canal em tempo real (SSE) da carteira e devolve:
 *  - conectado:  true enquanto a conexão está aberta
 *  - online:     membros com a carteira aberta agora [{ usuarioId, nome }]
 *  - atividades: últimas ações dos membros [{ acao, tipo, descricao, valor, usuarioNome, ... }]
 *
 * Callbacks opcionais:
 *  - onTransacao(evento): chamado a cada transação criada/editada/removida por qualquer membro
 *  - onReconectar():      chamado quando a conexão volta depois de uma queda
 *                         (eventos podem ter sido perdidos, então vale recarregar os dados)
 */
export default function useCarteiraAoVivo(walletId, { onTransacao, onReconectar } = {}) {
  const [conectado, setConectado] = useState(false);
  const [online, setOnline] = useState([]);
  const [atividades, setAtividades] = useState([]);

  // Guarda os callbacks mais recentes sem reabrir a conexão a cada render
  const callbacks = useRef({});
  callbacks.current = { onTransacao, onReconectar };

  useEffect(() => {
    const usuarioId = localStorage.getItem('usuarioId');
    if (!walletId || !usuarioId) return undefined;

    const fonte = new EventSource(carteiraService.urlEventos(walletId, usuarioId));
    let caiu = false;

    fonte.onopen = () => {
      setConectado(true);
      if (caiu) {
        caiu = false;
        callbacks.current.onReconectar?.();
      }
    };

    // O navegador tenta reconectar sozinho; enquanto isso mostramos "reconectando"
    fonte.onerror = () => {
      caiu = true;
      setConectado(false);
    };

    fonte.addEventListener('presenca', (e) => {
      try {
        setOnline(JSON.parse(e.data));
      } catch (erro) {
        console.error('Evento de presença inválido:', erro);
      }
    });

    fonte.addEventListener('transacao', (e) => {
      try {
        const evento = JSON.parse(e.data);
        setAtividades((anteriores) => [evento, ...anteriores].slice(0, 5));
        callbacks.current.onTransacao?.(evento);
      } catch (erro) {
        console.error('Evento de transação inválido:', erro);
      }
    });

    return () => {
      fonte.close();
      setConectado(false);
      setOnline([]);
      setAtividades([]);
    };
  }, [walletId]);

  return { conectado, online, atividades };
}
