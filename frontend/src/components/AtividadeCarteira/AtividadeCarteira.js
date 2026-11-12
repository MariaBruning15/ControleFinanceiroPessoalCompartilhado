import './AtividadeCarteira.css';

const ACOES = {
  CRIADA: 'adicionou',
  ATUALIZADA: 'editou',
  REMOVIDA: 'removeu',
};

function formatarValor(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarHora(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function descreverAtividade(a, meuId) {
  const quem = a.usuarioId === meuId ? 'Você' : a.usuarioNome;
  const acao = ACOES[a.acao] || 'alterou';
  const tipo = a.tipo === 'RECEITA' ? 'receita' : 'despesa';
  const detalhe = a.descricao ? ` — ${a.descricao}` : '';
  return `${quem} ${acao} uma ${tipo} de ${formatarValor(a.valor)}${detalhe}`;
}

/**
 * Indicador de atividade da carteira: status da conexão em tempo real,
 * quem está online agora e as últimas ações dos membros.
 */
function AtividadeCarteira({ conectado, online, atividades }) {
  const meuId = localStorage.getItem('usuarioId');
  const outros = online.filter((u) => u.usuarioId !== meuId);

  let resumo;
  if (!conectado) {
    resumo = 'Reconectando...';
  } else if (outros.length === 0) {
    resumo = 'Só você está nesta carteira agora';
  } else if (outros.length === 1) {
    resumo = `${outros[0].nome} também está nesta carteira`;
  } else {
    resumo = `${outros.map((u) => u.nome).join(', ')} estão nesta carteira`;
  }

  return (
    <div className="card text-white p-3 border-0 mb-4" style={{ backgroundColor: '#232943' }}>
      <div className="d-flex flex-wrap align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <span className={`atividade-ponto ${conectado ? 'ao-vivo' : ''}`}></span>
          <small className="fw-bold">{conectado ? 'Online' : 'Offline'}</small>
        </div>

        <div className="d-flex align-items-center">
          {online.map((u) => (
            <span
              key={u.usuarioId}
              className={`atividade-avatar ${u.usuarioId === meuId ? 'eu' : ''}`}
              title={u.usuarioId === meuId ? `${u.nome} (você)` : u.nome}
            >
              {u.nome.charAt(0).toUpperCase()}
            </span>
          ))}
        </div>

        <small className="text-white-50">{resumo}</small>
      </div>

      {atividades.length > 0 && (
        <ul className="list-unstyled mb-0 mt-3 small">
          {atividades.map((a, i) => (
            <li key={`${a.ocorridoEm}-${i}`} className="d-flex justify-content-between gap-3 py-1 border-top border-secondary">
              <span>{descreverAtividade(a, meuId)}</span>
              <span className="text-white-50 flex-shrink-0">{formatarHora(a.ocorridoEm)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AtividadeCarteira;
