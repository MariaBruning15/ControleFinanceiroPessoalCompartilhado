import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, LogOut, User, 
  LayoutDashboard, CreditCard, Tag, Settings 
} from 'lucide-react';

import transacaoService from '../../services/TransacaoService';
import usuarioService from '../../services/UsuarioService';
import authService from '../../services/AuthService';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [usuario, setUsuario] = useState({ nome: 'Usuário', email: '' });

  useEffect(() => {
    async function carregarDadosDashboard() {
      try {
        setLoading(true);

        // Executa as chamadas à API em paralelo para otimizar o carregamento
        const [resPerfil, resGrafico, resTransacoes] = await Promise.all([
          usuarioService.buscarPerfil(),
          transacaoService.buscarDadosGrafico(6),
          transacaoService.buscarRecentes(5)
        ]);

        if (resPerfil?.data) setUsuario(resPerfil.data);
        if (resGrafico?.data) setDadosGrafico(resGrafico.data);
        if (resTransacoes?.data) setTransacoes(resTransacoes.data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosDashboard();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  // Cálculo dinâmico dos indicadores baseado nas transações carregadas
  const totalReceitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalDespesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldoAtual = totalReceitas - totalDespesas;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-3 text-white fs-5">Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Menu Lateral (Sidebar) */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h2>Mercúrio</h2>
        </div>
        <nav className="sidebar-menu">
          <button className="menu-item active">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className="menu-item">
            <CreditCard size={20} /> Transações
          </button>
          <button className="menu-item">
            <Tag size={20} /> Categorias
          </button>
          <button className="menu-item" onClick={() => navigate('/alterar-senha')}>
            <Settings size={20} /> Configurações
          </button>
        </nav>
      </aside>

      {/* Área Principal */}
      <main className="main-content">
        {/* Header Superior */}
        <header className="dashboard-header">
          <div className="user-info">
            <div className="avatar">
              <User size={22} />
            </div>
            <div>
              <span className="user-name">Olá, {usuario.nome || usuario.name}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Sair">
            <LogOut size={18} /> Sair
          </button>
        </header>

        {/* Conteúdo do Dashboard */}
        <div className="dashboard-body">
          <h1 className="page-title">Resumo Financeiro</h1>

          {/* Cards de Indicadores */}
          <div className="cards-grid">
            <div className="card-kpi saldo">
              <div className="kpi-icon"><DollarSign size={24} /></div>
              <div className="kpi-info">
                <span>Saldo Atual</span>
                <h3>R$ {saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              </div>
            </div>

            <div className="card-kpi receita">
              <div className="kpi-icon"><TrendingUp size={24} /></div>
              <div className="kpi-info">
                <span>Receitas (Mês)</span>
                <h3>R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              </div>
            </div>

            <div className="card-kpi despesa">
              <div className="kpi-icon"><TrendingDown size={24} /></div>
              <div className="kpi-info">
                <span>Despesas (Mês)</span>
                <h3>R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
              </div>
            </div>
          </div>

          {/* Seção Central: Gráfico e Tabela */}
          <div className="dashboard-grid">
            {/* Gráfico Recharts */}
            <div className="dashboard-card chart-card">
              <h3>Balanço dos Últimos Meses</h3>
              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="mes" stroke="#ffffff80" />
                    <YAxis stroke="#ffffff80" />
                    <Tooltip 
                      formatter={(val) => `R$ ${val.toLocaleString('pt-BR')}`}
                      contentStyle={{ backgroundColor: '#202b53', borderColor: '#4a5b93', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="receitas" fill="#2e7d32" name="Receitas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="despesas" fill="#d32f2f" name="Despesas" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lista de Transações Recentes */}
            <div className="dashboard-card list-card">
              <h3>Lançamentos Recentes</h3>
              <div className="transactions-list">
                {transacoes.length === 0 ? (
                  <p className="text-white-50 text-center my-auto">Nenhuma transação encontrada.</p>
                ) : (
                  transacoes.map((t) => (
                    <div key={t.id} className="transaction-item">
                      <div className="t-info">
                        <span className="t-title">{t.descricao}</span>
                        <span className="t-date">{t.data}</span>
                      </div>
                      <span className={`t-amount ${t.tipo}`}>
                        {t.tipo === 'receita' ? '+' : '-'} R$ {Number(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;