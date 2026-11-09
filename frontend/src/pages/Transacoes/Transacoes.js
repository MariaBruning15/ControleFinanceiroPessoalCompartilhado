import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import transacaoService from '../../services/TransacaoService';
import categoriaService from '../../services/CategoriaService';
import carteiraService from '../../services/CarteiraService';
import './Transacoes.css';

const TAMANHO_PAGINA = 10;
const FILTROS_VAZIOS = { tipo: '', categoryId: '', startDate: '', endDate: '' };

function formatarData(data) {
  // Recebe 'YYYY-MM-DD' e evita conversão de fuso horário
  if (!data) return '—';
  const [ano, mes, dia] = String(data).split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarValor(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function Transacoes() {
  const navigate = useNavigate();

  const usuarioNome = localStorage.getItem('usuarioNome') || 'Usuário';
  const usuarioInicial = usuarioNome.charAt(0).toUpperCase();

  const [walletId, setWalletId] = useState(localStorage.getItem('carteiraId'));
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriasPorId, setCategoriasPorId] = useState({});
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS); // valores digitados no formulário
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_VAZIOS); // valores usados na busca
  const [erroFiltro, setErroFiltro] = useState('');
  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [excluindoId, setExcluindoId] = useState(null);

  // Garante que existe uma carteira ativa (mesma lógica do Dashboard, sem criar nada)
  useEffect(() => {
    const resolverCarteira = async () => {
      if (walletId) return;
      try {
        const resp = await carteiraService.listar();
        const carteiras = Array.isArray(resp?.data) ? resp.data : [];
        if (carteiras.length > 0) {
          localStorage.setItem('carteiraId', carteiras[0].id);
          setWalletId(carteiras[0].id);
        } else {
          setErro('Você ainda não tem nenhuma carteira. Crie uma na aba Carteiras.');
          setCarregando(false);
        }
      } catch (e) {
        console.error('Erro ao carregar carteiras:', e);
        setErro('Não foi possível carregar sua carteira.');
        setCarregando(false);
      }
    };
    resolverCarteira();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carrega as categorias uma vez, para exibir o nome mesmo que a transação não traga o objeto completo
  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const resp = await categoriaService.listar();
        const lista = Array.isArray(resp?.data) ? resp.data : [];
        const mapa = {};
        lista.forEach((c) => {
          mapa[c.id] = c.nome;
        });
        setCategorias(lista);
        setCategoriasPorId(mapa);
      } catch (e) {
        console.error('Erro ao carregar categorias:', e);
      }
    };
    carregarCategorias();
  }, []);

  useEffect(() => {
    if (walletId) {
      carregarTransacoes(walletId, pagina);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletId, pagina, filtrosAplicados]);

  const carregarTransacoes = async (carteiraId, numeroPagina) => {
    try {
      setCarregando(true);
      setErro('');
      const resp = await transacaoService.listar(carteiraId, numeroPagina, TAMANHO_PAGINA, filtrosAplicados);
      const dados = resp?.data || {};

      setTransacoes(Array.isArray(dados.content) ? dados.content : []);
      setTotalPaginas(dados.totalPages ?? dados.page?.totalPages ?? 0);
      setTotalElementos(dados.totalElements ?? dados.page?.totalElements ?? 0);
    } catch (e) {
      console.error('Erro ao carregar transações:', e.response?.data || e.message);
      setErro(e.response?.data?.message || 'Não foi possível carregar as transações.');
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluir = async (t) => {
    const resumo = `${formatarData(t.data)} - ${t.descricao || 'Sem descrição'} (${formatarValor(t.valor)})`;
    if (!window.confirm(`Excluir esta transação?\n\n${resumo}\n\nEssa ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setExcluindoId(t.id);
      await transacaoService.remover(walletId, t.id);

      // Se era o último item da página (e não é a primeira), volta uma página;
      // caso contrário, recarrega a página atual.
      if (transacoes.length === 1 && pagina > 0) {
        setPagina((p) => p - 1);
      } else {
        await carregarTransacoes(walletId, pagina);
      }
    } catch (e) {
      console.error('Erro ao excluir transação:', e.response?.data || e.message);
      alert(e.response?.data?.message || 'Não foi possível excluir a transação.');
    } finally {
      setExcluindoId(null);
    }
  };

  const handleMudarFiltro = (campo, valor) => {
    setFiltros((atual) => {
      const novo = { ...atual, [campo]: valor };
      // Se trocar o tipo e a categoria escolhida não for desse tipo, limpa a categoria
      if (campo === 'tipo' && atual.categoryId) {
        const cat = categorias.find((c) => c.id === atual.categoryId);
        if (valor && cat && cat.tipo !== valor) novo.categoryId = '';
      }
      return novo;
    });
  };

  const handleAplicarFiltros = (e) => {
    e.preventDefault();
    if (filtros.startDate && filtros.endDate && filtros.startDate > filtros.endDate) {
      setErroFiltro('A data inicial não pode ser maior que a data final.');
      return;
    }
    setErroFiltro('');
    setPagina(0);
    setFiltrosAplicados(filtros);
  };

  const handleLimparFiltros = () => {
    setErroFiltro('');
    setFiltros(FILTROS_VAZIOS);
    setPagina(0);
    setFiltrosAplicados(FILTROS_VAZIOS);
  };

  const filtrosAtivos = Object.values(filtrosAplicados).some(Boolean);
  const categoriasDoSelect = filtros.tipo
    ? categorias.filter((c) => c.tipo === filtros.tipo)
    : categorias;

  const nomeCategoria = (t) =>
    t.categoria?.nome || categoriasPorId[t.categoria?.id] || categoriasPorId[t.categoriaId] || '—';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const primeiraPagina = pagina === 0;
  const ultimaPagina = totalPaginas === 0 || pagina >= totalPaginas - 1;

  return (
    <div className="d-flex text-white min-vh-100" style={{ backgroundColor: '#1a1f36' }}>

      <aside className="p-3 border-end border-secondary d-flex flex-column" style={{ width: '240px', backgroundColor: '#141824' }}>
        <h3 className="text-primary font-weight-bold mb-4">Mercúrio</h3>
        <nav className="nav flex-column gap-2">
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn btn-primary text-start w-100">Transações</button>
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/categorias')}>Categorias</button>
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/carteiras')}>Carteiras</button>
          <button className="btn btn-outline-light text-start w-100">Perfil</button>
        </nav>
      </aside>

      <main className="flex-grow-1 d-flex flex-column">

        <header className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center" style={{ backgroundColor: '#141824' }}>
          <h4 className="m-0">Transações</h4>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '38px', height: '38px' }}>
                {usuarioInicial}
              </div>
              <span>{usuarioNome}</span>
            </div>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Sair</button>
          </div>
        </header>

        <div className="p-4 flex-grow-1">
          <div className="card text-white p-3 border-0" style={{ backgroundColor: '#232943' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="m-0">Histórico de Transações</h5>
              {!carregando && totalElementos > 0 && (
                <small className="text-white-50">{totalElementos} {totalElementos === 1 ? 'transação' : 'transações'}</small>
              )}
            </div>

            <form className="row g-2 align-items-end mb-3" onSubmit={handleAplicarFiltros}>
              <div className="col-6 col-lg-2">
                <label className="form-label small mb-1">Tipo</label>
                <select
                  className="form-select form-select-sm"
                  value={filtros.tipo}
                  onChange={(e) => handleMudarFiltro('tipo', e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="RECEITA">Receita</option>
                  <option value="DESPESA">Despesa</option>
                </select>
              </div>
              <div className="col-6 col-lg-3">
                <label className="form-label small mb-1">Categoria</label>
                <select
                  className="form-select form-select-sm"
                  value={filtros.categoryId}
                  onChange={(e) => handleMudarFiltro('categoryId', e.target.value)}
                >
                  <option value="">Todas</option>
                  {categoriasDoSelect.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-lg-2">
                <label className="form-label small mb-1">De</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={filtros.startDate}
                  onChange={(e) => handleMudarFiltro('startDate', e.target.value)}
                />
              </div>
              <div className="col-6 col-lg-2">
                <label className="form-label small mb-1">Até</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={filtros.endDate}
                  onChange={(e) => handleMudarFiltro('endDate', e.target.value)}
                />
              </div>
              <div className="col-12 col-lg-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm flex-grow-1">Filtrar</button>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm flex-grow-1"
                  onClick={handleLimparFiltros}
                  disabled={!filtrosAtivos && !Object.values(filtros).some(Boolean)}
                >
                  Limpar filtros
                </button>
              </div>
              {erroFiltro && <div className="col-12 text-danger small">{erroFiltro}</div>}
            </form>

            {erro ? (
              <div className="alert alert-danger mb-0">{erro}</div>
            ) : carregando ? (
              <div className="d-flex flex-column align-items-center justify-content-center py-5">
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <p>Carregando transações...</p>
              </div>
            ) : transacoes.length === 0 ? (
              <p className="text-white-50 text-center py-4 mb-0">
                {filtrosAtivos
                  ? 'Nenhuma transação encontrada com esses filtros.'
                  : 'Nenhuma transação cadastrada nesta carteira.'}
              </p>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-dark table-hover align-middle mb-0" style={{ '--bs-table-bg': 'transparent' }}>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Categoria</th>
                        <th>Tipo</th>
                        <th className="text-end">Valor</th>
                        <th className="text-end">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transacoes.map((t) => {
                        const receita = t.tipo === 'RECEITA';
                        return (
                          <tr key={t.id}>
                            <td>{formatarData(t.data)}</td>
                            <td>{t.descricao || '—'}</td>
                            <td>{nomeCategoria(t)}</td>
                            <td>
                              <span className={`badge ${receita ? 'bg-success' : 'bg-danger'}`}>
                                {receita ? 'Receita' : 'Despesa'}
                              </span>
                            </td>
                            <td className={`text-end fw-bold ${receita ? 'text-success' : 'text-danger'}`}>
                              {receita ? '+' : '-'} {formatarValor(t.valor)}
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleExcluir(t)}
                                disabled={excluindoId === t.id}
                              >
                                {excluindoId === t.id ? 'Excluindo...' : 'Excluir'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setPagina((p) => p - 1)}
                    disabled={primeiraPagina}
                  >
                    ← Anterior
                  </button>
                  <small className="text-white-50">
                    Página {pagina + 1} de {Math.max(totalPaginas, 1)}
                  </small>
                  <button
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setPagina((p) => p + 1)}
                    disabled={ultimaPagina}
                  >
                    Próxima →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Transacoes;
