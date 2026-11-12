import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import relatorioService from '../../services/RelatorioService';
import carteiraService from '../../services/CarteiraService';
import './Relatorios.css';

const moeda = (valor) =>
  Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function formatarData(data) {
  if (!data) return '—';
  const [ano, mes, dia] = String(data).split('T')[0].split('-');
  return `${dia}/${mes}/${ano}`;
}

function mesAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`;
}

function somarMeses(mes, delta) {
  const [ano, m] = mes.split('-').map(Number);
  const d = new Date(ano, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function nomeDoMes(mes) {
  const [ano, m] = mes.split('-').map(Number);
  return new Date(ano, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

// Variação percentual em texto, ex.: "+12,5% vs mês anterior"
function textoVariacao(atual, anterior) {
  const a = Number(atual || 0);
  const b = Number(anterior || 0);
  if (b === 0) return a === 0 ? 'sem movimento no mês anterior' : 'sem dados no mês anterior';
  const variacao = ((a - b) / b) * 100;
  const sinal = variacao > 0 ? '+' : '';
  return `${sinal}${variacao.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% vs mês anterior`;
}

// CSV em UTF-8 com BOM e ";" como separador, para abrir direto no Excel em português
function escaparCsv(valor) {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  return /[;"\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function gerarCsv(r) {
  const num = (v) => Number(v || 0).toFixed(2).replace('.', ',');
  const linhas = [
    ['Relatório mensal', nomeDoMes(r.mes)],
    ['Carteira', r.carteiraNome],
    [],
    ['RESUMO'],
    ['Saldo no início do mês', num(r.saldoInicial)],
    ['Total de receitas', num(r.totalReceitas)],
    ['Total de despesas', num(r.totalDespesas)],
    ['Resultado do mês', num(r.resultadoMes)],
    ['Saldo no fim do mês', num(r.saldoFinal)],
    ['Quantidade de transações', r.quantidadeTransacoes],
    [],
    ['POR CATEGORIA'],
    ['Tipo', 'Categoria', 'Total', 'Quantidade', 'Percentual do tipo (%)'],
    ...r.porCategoria.map((c) => [
      c.tipo === 'RECEITA' ? 'Receita' : 'Despesa',
      c.categoria,
      num(c.total),
      c.quantidade,
      Number(c.percentual || 0).toFixed(1).replace('.', ','),
    ]),
    [],
    ['EXTRATO DO MÊS'],
    ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Lançado por'],
    ...r.lancamentos.map((l) => [
      formatarData(l.data),
      l.descricao,
      l.categoria,
      l.tipo === 'RECEITA' ? 'Receita' : 'Despesa',
      num(l.valor),
      l.criadoPor,
    ]),
  ];
  return '\uFEFF' + linhas.map((l) => l.map(escaparCsv).join(';')).join('\r\n');
}

function Relatorios() {
  const navigate = useNavigate();

  const usuarioNome = localStorage.getItem('usuarioNome') || 'Usuário';
  const usuarioInicial = usuarioNome.charAt(0).toUpperCase();

  const [walletId, setWalletId] = useState(localStorage.getItem('carteiraId'));
  const [mes, setMes] = useState(mesAtual());
  const [relatorio, setRelatorio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Garante uma carteira ativa (mesma lógica das outras telas, sem criar nada)
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

  useEffect(() => {
    if (!walletId || !mes) return;

    const carregar = async () => {
      try {
        setCarregando(true);
        setErro('');
        const resp = await relatorioService.resumoMensal(walletId, mes);
        setRelatorio(resp.data);
      } catch (e) {
        console.error('Erro ao gerar relatório:', e.response?.data || e.message);
        setRelatorio(null);
        setErro(e.response?.data?.message || 'Não foi possível gerar o relatório.');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [walletId, mes]);

  const handleExportarCsv = () => {
    if (!relatorio) return;
    const blob = new Blob([gerarCsv(relatorio)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${relatorio.mes}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const receitasPorCategoria = relatorio?.porCategoria.filter((c) => c.tipo === 'RECEITA') || [];
  const despesasPorCategoria = relatorio?.porCategoria.filter((c) => c.tipo === 'DESPESA') || [];
  const resultadoPositivo = Number(relatorio?.resultadoMes || 0) >= 0;

  const tabelaCategorias = (titulo, lista, corTexto, corBarra) => (
    <div className="col-md-6 mb-3">
      <h6 className={corTexto}>{titulo}</h6>
      {lista.length === 0 ? (
        <small className="text-white-50">Nenhum lançamento neste mês.</small>
      ) : (
        lista.map((c) => (
          <div key={`${c.tipo}-${c.categoriaId}`} className="mb-2">
            <div className="d-flex justify-content-between">
              <span>
                {c.categoria} <small className="text-white-50">({c.quantidade})</small>
              </span>
              <span className="fw-bold">
                {moeda(c.total)} <small className="text-white-50">· {Number(c.percentual).toLocaleString('pt-BR')}%</small>
              </span>
            </div>
            <div className="relatorio-barra">
              <div style={{ width: `${Math.min(Number(c.percentual), 100)}%`, backgroundColor: corBarra }}></div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="d-flex text-white min-vh-100 relatorio-pagina" style={{ backgroundColor: '#1a1f36' }}>

      <aside className="p-3 border-end border-secondary d-flex flex-column no-print" style={{ width: '240px', backgroundColor: '#141824' }}>
        <h3 className="text-primary font-weight-bold mb-4">Mercúrio</h3>
        <nav className="nav flex-column gap-2">
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/transacoes')}>Transações</button>
          <button className="btn btn-primary text-start w-100">Relatórios</button>
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/categorias')}>Categorias</button>
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/carteiras')}>Carteiras</button>
          <button className="btn btn-outline-light text-start w-100">Perfil</button>
        </nav>
      </aside>

      <main className="flex-grow-1 d-flex flex-column">

        <header className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center no-print" style={{ backgroundColor: '#141824' }}>
          <h4 className="m-0">Relatórios</h4>
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

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 no-print">
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-outline-light btn-sm" onClick={() => setMes(somarMeses(mes, -1))} title="Mês anterior">←</button>
              <input
                type="month"
                className="form-control form-control-sm"
                style={{ width: '170px' }}
                value={mes}
                max={mesAtual()}
                onChange={(e) => e.target.value && setMes(e.target.value)}
              />
              <button
                className="btn btn-outline-light btn-sm"
                onClick={() => setMes(somarMeses(mes, 1))}
                disabled={mes >= mesAtual()}
                title="Próximo mês"
              >
                →
              </button>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-light btn-sm" onClick={handleExportarCsv} disabled={!relatorio}>
                Exportar CSV
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => window.print()} disabled={!relatorio}>
                Imprimir / Salvar PDF
              </button>
            </div>
          </div>

          {erro ? (
            <div className="alert alert-danger">{erro}</div>
          ) : carregando || !relatorio ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <div className="spinner-border text-primary mb-3" role="status"></div>
              <p>Gerando relatório...</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="mb-1">Resumo mensal — {nomeDoMes(relatorio.mes)}</h3>
                <small className="text-white-50">
                  Carteira: {relatorio.carteiraNome} · Gerado em{' '}
                  {new Date(relatorio.geradoEm).toLocaleString('pt-BR')} · {relatorio.quantidadeTransacoes}{' '}
                  {relatorio.quantidadeTransacoes === 1 ? 'transação' : 'transações'}
                </small>
              </div>

              <div className="row mb-2">
                <div className="col-md-3 mb-3">
                  <div className="card text-white p-3 border-0 h-100" style={{ backgroundColor: '#232943' }}>
                    <small className="text-white-50">Saldo no início do mês</small>
                    <h4 className="mt-2 mb-0">{moeda(relatorio.saldoInicial)}</h4>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card text-white p-3 border-0 h-100" style={{ backgroundColor: '#232943' }}>
                    <small className="text-white-50">Receitas</small>
                    <h4 className="text-success mt-2 mb-1">{moeda(relatorio.totalReceitas)}</h4>
                    <small className="text-white-50">{textoVariacao(relatorio.totalReceitas, relatorio.receitasMesAnterior)}</small>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card text-white p-3 border-0 h-100" style={{ backgroundColor: '#232943' }}>
                    <small className="text-white-50">Despesas</small>
                    <h4 className="text-danger mt-2 mb-1">{moeda(relatorio.totalDespesas)}</h4>
                    <small className="text-white-50">{textoVariacao(relatorio.totalDespesas, relatorio.despesasMesAnterior)}</small>
                  </div>
                </div>
                <div className="col-md-3 mb-3">
                  <div className="card text-white p-3 border-0 h-100" style={{ backgroundColor: '#232943' }}>
                    <small className="text-white-50">Saldo no fim do mês</small>
                    <h4 className="mt-2 mb-1">{moeda(relatorio.saldoFinal)}</h4>
                    <small className={resultadoPositivo ? 'text-success' : 'text-danger'}>
                      Resultado do mês: {resultadoPositivo ? '+' : ''}{moeda(relatorio.resultadoMes)}
                    </small>
                  </div>
                </div>
              </div>

              <div className="card text-white p-3 border-0 mb-4" style={{ backgroundColor: '#232943' }}>
                <h5 className="mb-3">Por categoria</h5>
                <div className="row">
                  {tabelaCategorias('Despesas', despesasPorCategoria, 'text-danger', '#e74c3c')}
                  {tabelaCategorias('Receitas', receitasPorCategoria, 'text-success', '#2ecc71')}
                </div>
              </div>

              <div className="card text-white p-3 border-0 mb-4" style={{ backgroundColor: '#232943' }}>
                <h5 className="mb-3">Maiores despesas do mês</h5>
                {relatorio.maioresDespesas.length === 0 ? (
                  <small className="text-white-50">Nenhuma despesa neste mês.</small>
                ) : (
                  <ul className="list-group list-group-flush">
                    {relatorio.maioresDespesas.map((l) => (
                      <li key={l.id} className="list-group-item bg-transparent text-white d-flex justify-content-between border-secondary px-0">
                        <div>
                          <div className="fw-bold">{l.descricao || '—'}</div>
                          <small className="text-white-50">
                            {formatarData(l.data)} · {l.categoria}{l.criadoPor ? ` · ${l.criadoPor}` : ''}
                          </small>
                        </div>
                        <span className="text-danger fw-bold">- {moeda(l.valor)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card text-white p-3 border-0" style={{ backgroundColor: '#232943' }}>
                <h5 className="mb-3">Extrato do mês</h5>
                {relatorio.lancamentos.length === 0 ? (
                  <small className="text-white-50">Nenhuma transação neste mês.</small>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark align-middle mb-0" style={{ '--bs-table-bg': 'transparent' }}>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Descrição</th>
                          <th>Categoria</th>
                          <th>Lançado por</th>
                          <th className="text-end">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatorio.lancamentos.map((l) => {
                          const receita = l.tipo === 'RECEITA';
                          return (
                            <tr key={l.id}>
                              <td>{formatarData(l.data)}</td>
                              <td>{l.descricao || '—'}</td>
                              <td>{l.categoria}</td>
                              <td>{l.criadoPor || '—'}</td>
                              <td className={`text-end fw-bold ${receita ? 'text-success' : 'text-danger'}`}>
                                {receita ? '+' : '-'} {moeda(l.valor)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Relatorios;
