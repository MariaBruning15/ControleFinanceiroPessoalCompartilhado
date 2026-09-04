import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import carteiraService from '../../services/CarteiraService';
import './Carteiras.css';

function Carteiras() {
  const navigate = useNavigate();

  const usuarioNome = localStorage.getItem('usuarioNome') || 'Usuário';
  const usuarioInicial = usuarioNome.charAt(0).toUpperCase();

  const [carteiras, setCarteiras] = useState([]);
  const [carteiraAtivaId, setCarteiraAtivaId] = useState(localStorage.getItem('carteiraId') || '');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarCarteiras();
  }, []);

  const carregarCarteiras = async () => {
    try {
      setCarregando(true);
      const resp = await carteiraService.listar();
      setCarteiras(Array.isArray(resp?.data) ? resp.data : []);
    } catch (erro) {
      console.error('Erro ao carregar carteiras:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const handleCriarCarteira = async (e) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim()) {
      setErro('Informe um nome para a carteira.');
      return;
    }

    try {
      setSalvando(true);
      const resp = await carteiraService.criar({
        nome: nome.trim(),
        descricao: descricao.trim() || null,
        saldoInicial: saldoInicial ? parseFloat(saldoInicial) : 0,
      });

      setNome('');
      setDescricao('');
      setSaldoInicial('');
      await carregarCarteiras();

      // Se essa é a primeira carteira do usuário, já deixa ela ativa
      if (!carteiraAtivaId && resp?.data?.id) {
        handleUsarCarteira(resp.data.id);
      }
    } catch (erroReq) {
      const dadosErro = erroReq.response?.data;
      console.error('Erro ao criar carteira:', dadosErro || erroReq.message);
      setErro(dadosErro?.message || 'Erro ao criar carteira. Verifique os dados e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleUsarCarteira = (id) => {
    localStorage.setItem('carteiraId', id);
    setCarteiraAtivaId(id);
  };

  const handleRemoverCarteira = async (carteira) => {
    if (!window.confirm(`Remover a carteira "${carteira.nome}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await carteiraService.remover(carteira.id);
      if (carteiraAtivaId === carteira.id) {
        localStorage.removeItem('carteiraId');
        setCarteiraAtivaId('');
      }
      await carregarCarteiras();
    } catch (erroReq) {
      const dadosErro = erroReq.response?.data;
      alert(dadosErro?.message || 'Não foi possível remover essa carteira.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="d-flex text-white min-vh-100" style={{ backgroundColor: '#1a1f36' }}>

      <aside className="p-3 border-end border-secondary d-flex flex-column" style={{ width: '240px', backgroundColor: '#141824' }}>
        <h3 className="text-primary font-weight-bold mb-4">Mercúrio</h3>
        <nav className="nav flex-column gap-2">
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/dashboard')}>Transações</button>
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/categorias')}>Categorias</button>
          <button className="btn btn-primary text-start w-100">Carteiras</button>
          <button className="btn btn-outline-light text-start w-100">Perfil</button>
        </nav>
      </aside>

      <main className="flex-grow-1 d-flex flex-column">

        <header className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center" style={{ backgroundColor: '#141824' }}>
          <h4 className="m-0">Carteiras</h4>
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
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="card text-white p-3 border-0" style={{ backgroundColor: '#232943' }}>
                <h5 className="mb-3">Nova Carteira</h5>
                <form onSubmit={handleCriarCarteira}>
                  <div className="mb-3">
                    <label className="form-label">Nome</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Carteira Pessoal, Casa..."
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descrição (opcional)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Ex: Gastos do dia a dia"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Saldo Inicial (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={saldoInicial}
                      onChange={(e) => setSaldoInicial(e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                  {erro && <div className="text-danger mb-3 small">{erro}</div>}
                  <button type="submit" className="btn btn-primary w-100" disabled={salvando}>
                    {salvando ? 'Salvando...' : 'Adicionar Carteira'}
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-8 mb-4">
              <div className="card text-white p-3 border-0" style={{ backgroundColor: '#232943' }}>
                <h5 className="mb-3">Suas Carteiras</h5>
                {carregando ? (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <p>Carregando carteiras...</p>
                  </div>
                ) : carteiras.length === 0 ? (
                  <p className="text-muted text-center py-4">Nenhuma carteira cadastrada ainda. Crie a primeira ao lado.</p>
                ) : (
                  <ul className="list-group list-group-flush">
                    {carteiras.map((cart) => {
                      const ativa = cart.id === carteiraAtivaId;
                      return (
                        <li
                          key={cart.id}
                          className="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center border-secondary px-0"
                        >
                          <div>
                            <div className="fw-bold">
                              {cart.nome}{' '}
                              {ativa && <span className="badge bg-success ms-1">Ativa</span>}
                            </div>
                            {cart.descricao && <small className="text-muted d-block">{cart.descricao}</small>}
                            <small className="text-muted">Saldo inicial: R$ {Number(cart.saldoInicial || 0).toFixed(2)}</small>
                          </div>
                          <div className="d-flex gap-2">
                            {!ativa && (
                              <button className="btn btn-sm btn-outline-light" onClick={() => handleUsarCarteira(cart.id)}>
                                Usar esta
                              </button>
                            )}
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoverCarteira(cart)}>
                              Remover
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Carteiras;
