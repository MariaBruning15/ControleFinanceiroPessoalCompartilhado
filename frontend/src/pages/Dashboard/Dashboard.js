import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import transacaoService from '../../services/TransacaoService';
import carteiraService from '../../services/CarteiraService';
import TransacaoModal from '../../components/TransacaoModal/TransacaoModal';
import AtividadeCarteira from '../../components/AtividadeCarteira/AtividadeCarteira';
import useCarteiraAoVivo from '../../hooks/useCarteiraAoVivo';
import './Dashboard.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const navigate = useNavigate();

  const usuarioNome = localStorage.getItem('usuarioNome') || 'Usuário';
  const usuarioInicial = usuarioNome.charAt(0).toUpperCase();

  const [walletId, setWalletId] = useState(null);
  const [erroCarteira, setErroCarteira] = useState('');

  const [resumo, setResumo] = useState({
    saldoTotal: 0,
    totalReceitas: 0,
    totalDespesas: 0,
  });

  const [dadosGrafico, setDadosGrafico] = useState({
    labels: [],
    datasets: [],
  });

  const [recentes, setRecentes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [exibirModal, setExibirModal] = useState(false);

  // Tempo real: quando outro membro mexe numa transação, atualiza o resumo e o gráfico na hora
  const { conectado, online, atividades } = useCarteiraAoVivo(walletId, {
    onTransacao: (evento) => {
      if (evento.usuarioId !== localStorage.getItem('usuarioId')) {
        carregarDadosDashboard(walletId, true);
      }
    },
    onReconectar: () => carregarDadosDashboard(walletId, true),
  });

  useEffect(() => {
    resolverCarteira();
  }, []);

  useEffect(() => {
    if (walletId) {
      carregarDadosDashboard(walletId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletId]);

  // Busca as carteiras do usuário logado; se ele ainda não tiver nenhuma,
  // cria uma carteira padrão automaticamente (evita usar um ID fixo/inexistente).
  const resolverCarteira = async () => {
    try {
      setCarregando(true);
      const resp = await carteiraService.listar();
      const carteiras = Array.isArray(resp?.data) ? resp.data : [];

      const carteiraSalva = localStorage.getItem('carteiraId');
      const carteiraValida = carteiras.find((c) => c.id === carteiraSalva);

      let carteiraEscolhida = carteiraValida || carteiras[0];

      if (!carteiraEscolhida) {
        const criada = await carteiraService.criar({
          nome: 'Minha Carteira',
          descricao: 'Carteira criada automaticamente',
          saldoInicial: 0,
        });
        carteiraEscolhida = criada.data;
      }

      localStorage.setItem('carteiraId', carteiraEscolhida.id);
      setWalletId(carteiraEscolhida.id);
    } catch (erro) {
      console.error('Erro ao carregar carteiras do usuário:', erro);
      setErroCarteira('Não foi possível carregar sua carteira. Tente sair e entrar novamente.');
      setCarregando(false);
    }
  };

  // silencioso = true atualiza os dados sem trocar a tela pelo "carregando" (usado no tempo real)
  const carregarDadosDashboard = async (walletIdAtual, silencioso = false) => {
    try {
      if (!silencioso) setCarregando(true);

      const [summaryResp, recentesResp] = await Promise.all([
        transacaoService.obterResumoDashboard(walletIdAtual),
        transacaoService.listarRecentes(walletIdAtual, 0, 5),
      ]);

      if (summaryResp?.data) {
        const summary = summaryResp.data;

        setResumo({
          saldoTotal: summary.balance || 0,
          totalReceitas: summary.totalIncome || 0,
          totalDespesas: summary.totalExpense || 0,
        });

        if (summary.byMonth && Array.isArray(summary.byMonth)) {
          const labels = summary.byMonth.map((item) => item.month);
          const despesas = summary.byMonth.map((item) => item.expense || 0);
          const receitas = summary.byMonth.map((item) => item.income || 0);

          setDadosGrafico({
            labels: labels,
            datasets: [
              {
                label: 'Despesas',
                data: despesas,
                backgroundColor: '#e74c3c',
                borderRadius: 4,
              },
              {
                label: 'Receitas',
                data: receitas,
                backgroundColor: '#2ecc71',
                borderRadius: 4,
              },
            ],
          });
        }
      }

      if (recentesResp?.data?.content) {
        setRecentes(recentesResp.data.content);
      } else if (Array.isArray(recentesResp?.data)) {
        setRecentes(recentesResp.data);
      }

    } catch (erro) {
      console.error('Erro ao carregar dados do dashboard:', erro);
    } finally {
      if (!silencioso) setCarregando(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const opcoesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#ffffff' },
      },
    },
    scales: {
      x: {
        ticks: { color: '#ffffff' },
        grid: { display: false },
      },
      y: {
        ticks: { color: '#ffffff' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  return (
    <div className="d-flex text-white min-vh-100" style={{ backgroundColor: '#1a1f36' }}>
      
      <aside className="p-3 border-end border-secondary d-flex flex-column" style={{ width: '240px', backgroundColor: '#141824' }}>
        <h3 className="text-primary font-weight-bold mb-4">Mercúrio</h3>
        <nav className="nav flex-column gap-2">
          <button className="btn btn-primary text-start w-100">Dashboard</button>
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/transacoes')}>Transações</button>
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/categorias')}>Categorias</button>
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/carteiras')}>Carteiras</button>
          <button className="btn btn-outline-light text-start w-100">Perfil</button>
        </nav>
      </aside>

      <main className="flex-grow-1 d-flex flex-column">
        
        <header className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center" style={{ backgroundColor: '#141824' }}>
          <h4 className="m-0">Resumo Financeiro</h4>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-primary me-2" onClick={() => setExibirModal(true)} disabled={!walletId}>
              + Nova Transação
            </button>
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '38px', height: '38px' }}>
                {usuarioInicial}
              </div>
              <span>{usuarioNome}</span>
            </div>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>Sair</button>
          </div>
        </header>

        <div className="p-4 flex-grow-1">
          {walletId && <AtividadeCarteira conectado={conectado} online={online} atividades={atividades} />}

          {erroCarteira ? (
            <div className="alert alert-danger">{erroCarteira}</div>
          ) : carregando ? (
            <div className="d-flex flex-column align-items-center justify-content-center h-100 py-5">
              <div className="spinner-border text-primary mb-3" role="status"></div>
              <p>Carregando informações financeiras...</p>
            </div>
          ) : (
            <>
              <div className="row mb-4">
                <div className="col-md-4 mb-3">
                  <div className="card text-white p-3 border-0" style={{ backgroundColor: '#232943' }}>
                    <small className="text-white">Saldo Atual</small>
                    <h3 className="text-primary mt-2">R$ {resumo.saldoTotal.toFixed(2)}</h3>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card text-white p-3 border-0" style={{ backgroundColor: '#232943' }}>
                    <small className="text-white">Receitas (Período)</small>
                    <h3 className="text-success mt-2">R$ {resumo.totalReceitas.toFixed(2)}</h3>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card text-white p-3 border-0" style={{ backgroundColor: '#232943' }}>
                    <small className="text-white">Despesas (Período)</small>
                    <h3 className="text-danger mt-2">R$ {resumo.totalDespesas.toFixed(2)}</h3>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-7 mb-4">
                  <div className="card text-white p-3 h-100 border-0" style={{ backgroundColor: '#232943' }}>
                    <h5 className="mb-3">Balanço dos Últimos Meses</h5>
                    <div style={{ height: '300px' }}>
                      {dadosGrafico.labels.length > 0 ? (
                        <Bar data={dadosGrafico} options={opcoesGrafico} />
                      ) : (
                        <div className="d-flex h-100 align-items-center justify-content-center text-white">
                          Nenhum lançamento encontrado para montar o gráfico.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-lg-5 mb-4">
                  <div className="card text-white p-3 h-100 border-0" style={{ backgroundColor: '#232943' }}>
                    <h5 className="mb-3">Lançamentos Recentes</h5>
                    {recentes.length > 0 ? (
                      <ul className="list-group list-group-flush">
                        {recentes.map((item, idx) => (
                          <li key={item.id || idx} className="list-group-item bg-transparent text-white d-flex justify-content-between border-secondary px-0">
                            <div>
                              <div className="fw-bold">{item.descricao}</div>
                              <small className="text-muted">{item.data}</small>
                            </div>
                            <span className={item.tipo === 'RECEITA' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                              {item.tipo === 'RECEITA' ? '+' : '-'} R$ {item.valor?.toFixed(2)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-white my-auto text-center py-4">Nenhuma transação cadastrada.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {exibirModal && (
        <TransacaoModal
          walletId={walletId}
          onFechar={() => setExibirModal(false)}
          onSalvo={() => carregarDadosDashboard(walletId)}
        />
      )}
    </div>
  );
}

export default Dashboard;