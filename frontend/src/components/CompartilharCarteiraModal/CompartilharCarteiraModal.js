import { useState, useEffect } from 'react';
import carteiraService from '../../services/CarteiraService';

const PAPEIS = [
  { valor: 'DONO', rotulo: 'Dono' },
  { valor: 'EDITOR', rotulo: 'Editor' },
  { valor: 'VISUALIZADOR', rotulo: 'Visualizador' },
];

export function rotuloPapel(papel) {
  return PAPEIS.find((p) => p.valor === papel)?.rotulo || papel;
}

/**
 * Modal de compartilhamento: lista os membros da carteira e, para o DONO,
 * permite convidar por e-mail, trocar o papel e remover membros.
 *
 * Props:
 *  - carteira:  { id, nome }
 *  - onFechar:  fecha o modal
 *  - onAlterado: chamado quando a lista de membros muda (para atualizar a tela de trás)
 */
function CompartilharCarteiraModal({ carteira, onFechar, onAlterado }) {
  const meuId = localStorage.getItem('usuarioId');

  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [email, setEmail] = useState('');
  const [papel, setPapel] = useState('EDITOR');
  const [convidando, setConvidando] = useState(false);
  const [ocupadoId, setOcupadoId] = useState(null); // membro com ação em andamento

  const souDono = membros.some((m) => m.usuarioId === meuId && m.papel === 'DONO');

  useEffect(() => {
    carregarMembros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mensagemDe = (e, padrao) => e.response?.data?.message || padrao;

  const carregarMembros = async () => {
    try {
      setCarregando(true);
      const resp = await carteiraService.listarMembros(carteira.id);
      setMembros(Array.isArray(resp?.data) ? resp.data : []);
    } catch (e) {
      console.error('Erro ao carregar membros:', e.response?.data || e.message);
      setErro(mensagemDe(e, 'Não foi possível carregar os membros.'));
    } finally {
      setCarregando(false);
    }
  };

  const handleConvidar = async (e) => {
    e.preventDefault();
    setErro('');

    if (!email.trim()) {
      setErro('Informe o e-mail de quem você quer convidar.');
      return;
    }

    try {
      setConvidando(true);
      await carteiraService.adicionarMembro(carteira.id, email.trim(), papel);
      setEmail('');
      setPapel('EDITOR');
      await carregarMembros();
      if (onAlterado) onAlterado();
    } catch (err) {
      console.error('Erro ao adicionar membro:', err.response?.data || err.message);
      setErro(mensagemDe(err, 'Não foi possível adicionar esse membro.'));
    } finally {
      setConvidando(false);
    }
  };

  const handleAlterarPapel = async (membro, novoPapel) => {
    if (novoPapel === membro.papel) return;
    setErro('');
    try {
      setOcupadoId(membro.usuarioId);
      await carteiraService.alterarPapel(carteira.id, membro.usuarioId, novoPapel);
      await carregarMembros();
      if (onAlterado) onAlterado();
    } catch (err) {
      console.error('Erro ao alterar papel:', err.response?.data || err.message);
      setErro(mensagemDe(err, 'Não foi possível alterar o papel desse membro.'));
    } finally {
      setOcupadoId(null);
    }
  };

  const handleRemover = async (membro) => {
    if (!window.confirm(`Remover ${membro.nome} desta carteira?`)) return;
    setErro('');
    try {
      setOcupadoId(membro.usuarioId);
      await carteiraService.removerMembro(carteira.id, membro.usuarioId);
      await carregarMembros();
      if (onAlterado) onAlterado();
    } catch (err) {
      console.error('Erro ao remover membro:', err.response?.data || err.message);
      setErro(mensagemDe(err, 'Não foi possível remover esse membro.'));
    } finally {
      setOcupadoId(null);
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content text-white" style={{ backgroundColor: '#232943' }}>
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Compartilhar “{carteira.nome}”</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onFechar}></button>
          </div>

          <div className="modal-body">
            {souDono && (
              <form className="row g-2 align-items-end mb-4" onSubmit={handleConvidar}>
                <div className="col-12 col-md-6">
                  <label className="form-label small mb-1">E-mail de quem tem conta no sistema</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@exemplo.com"
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label small mb-1">Papel</label>
                  <select className="form-select" value={papel} onChange={(e) => setPapel(e.target.value)}>
                    {PAPEIS.map((p) => (
                      <option key={p.valor} value={p.valor}>{p.rotulo}</option>
                    ))}
                  </select>
                </div>
                <div className="col-6 col-md-3">
                  <button type="submit" className="btn btn-primary w-100" disabled={convidando}>
                    {convidando ? 'Convidando...' : 'Convidar'}
                  </button>
                </div>
              </form>
            )}

            {erro && <div className="alert alert-danger py-2">{erro}</div>}

            {carregando ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark align-middle mb-0" style={{ '--bs-table-bg': 'transparent' }}>
                  <thead>
                    <tr>
                      <th>Membro</th>
                      <th>Papel</th>
                      {souDono && <th className="text-end">Ações</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {membros.map((m) => {
                      const eu = m.usuarioId === meuId;
                      const ocupado = ocupadoId === m.usuarioId;
                      return (
                        <tr key={m.usuarioId}>
                          <td>
                            <div className="fw-bold">
                              {m.nome} {eu && <span className="badge bg-secondary ms-1">Você</span>}
                            </div>
                            <small className="text-white-50">{m.email}</small>
                          </td>
                          <td>
                            {souDono ? (
                              <select
                                className="form-select form-select-sm"
                                style={{ maxWidth: '160px' }}
                                value={m.papel}
                                disabled={ocupado}
                                onChange={(e) => handleAlterarPapel(m, e.target.value)}
                              >
                                {PAPEIS.map((p) => (
                                  <option key={p.valor} value={p.valor}>{p.rotulo}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="badge bg-primary">{rotuloPapel(m.papel)}</span>
                            )}
                          </td>
                          {souDono && (
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-danger"
                                disabled={ocupado}
                                onClick={() => handleRemover(m)}
                              >
                                Remover
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <small className="text-white-50 d-block mt-3">
              <strong>Dono:</strong> gerencia membros e a carteira. <strong>Editor:</strong> cria, edita e exclui
              transações. <strong>Visualizador:</strong> só consulta.
            </small>
          </div>

          <div className="modal-footer border-secondary">
            <button type="button" className="btn btn-secondary" onClick={onFechar}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompartilharCarteiraModal;
