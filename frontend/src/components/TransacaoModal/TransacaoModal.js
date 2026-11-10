import { useState, useEffect } from 'react';
import transacaoService from '../../services/TransacaoService';
import categoriaService from '../../services/CategoriaService';

// Data de hoje no fuso local (toISOString usa UTC e pode devolver o dia seguinte à noite,
// o que o backend rejeita por ser uma data futura).
function hojeLocal() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

/**
 * Modal de criação/edição de transação.
 *
 * Props:
 *  - walletId: id da carteira onde a transação será criada/editada
 *  - transacao: objeto da transação para editar; se omitido, o modal cria uma nova
 *  - onFechar: chamado ao cancelar/fechar ou depois de salvar
 *  - onSalvo: chamado depois que a transação foi salva com sucesso
 *
 * Renderize-o apenas enquanto estiver aberto ({aberto && <TransacaoModal ... />}),
 * assim os campos sempre iniciam com os valores certos.
 */
function TransacaoModal({ walletId, transacao = null, onFechar, onSalvo }) {
  const editando = Boolean(transacao);

  const [descricao, setDescricao] = useState(transacao?.descricao || '');
  const [valor, setValor] = useState(transacao ? String(transacao.valor ?? '') : '');
  const [tipo, setTipo] = useState(transacao?.tipo || 'RECEITA');
  const [data, setData] = useState(transacao?.data ? String(transacao.data).split('T')[0] : hojeLocal());
  const [categoriaId, setCategoriaId] = useState(transacao?.categoria?.id || transacao?.categoriaId || '');
  const [categorias, setCategorias] = useState([]);
  const [salvando, setSalvando] = useState(false);

  // Carrega as categorias do tipo selecionado (e ignora respostas atrasadas)
  useEffect(() => {
    let cancelado = false;

    const carregarCategorias = async () => {
      try {
        const resp = await categoriaService.listar(tipo);
        if (cancelado) return;
        const lista = Array.isArray(resp?.data) ? resp.data : [];
        setCategorias(lista);
        // Mantém a categoria escolhida só se ela existir na lista deste tipo
        setCategoriaId((atual) => (lista.some((c) => c.id === atual) ? atual : ''));
      } catch (erro) {
        if (cancelado) return;
        console.error('Erro ao carregar categorias:', erro);
        setCategorias([]);
      }
    };

    carregarCategorias();
    return () => {
      cancelado = true;
    };
  }, [tipo]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoriaId) {
      alert('Selecione uma categoria para a transação.');
      return;
    }

    const payload = {
      descricao,
      valor: parseFloat(valor),
      tipo, // 'RECEITA' ou 'DESPESA'
      data,
      categoriaId,
    };

    try {
      setSalvando(true);

      if (editando) {
        await transacaoService.atualizar(walletId, transacao.id, payload);
      } else {
        await transacaoService.criarTransacao(walletId, payload);
      }

      onFechar();
      if (onSalvo) onSalvo();
    } catch (erro) {
      const dadosErro = erro.response?.data;
      console.error('Erro ao salvar transação:', dadosErro || erro.message);

      const mensagem = dadosErro?.message
        ? `Erro ao salvar a transação: ${dadosErro.message}`
        : 'Erro ao salvar a transação. Verifique se os dados estão corretos.';
      alert(mensagem);
      setSalvando(false);
    }
  };

  return (
    <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content text-white" style={{ backgroundColor: '#232943' }}>
          <div className="modal-header border-secondary">
            <h5 className="modal-title">{editando ? 'Editar Transação' : 'Nova Transação'}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onFechar}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Descrição</label>
                <input
                  type="text"
                  className="form-control"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Mercado, Salário..."
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Tipo</label>
                <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="RECEITA">Receita</option>
                  <option value="DESPESA">Despesa</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Categoria</label>
                <select
                  className="form-select"
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
                {categorias.length === 0 && (
                  <small className="text-muted d-block mt-1">
                    Nenhuma categoria cadastrada para esse tipo.{' '}
                    <a href="/categorias" className="text-primary">Cadastre uma aqui</a> antes de lançar a transação.
                  </small>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Data</label>
                <input
                  type="date"
                  className="form-control"
                  value={data}
                  max={hojeLocal()}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-secondary" onClick={onFechar}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar Transação'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TransacaoModal;
