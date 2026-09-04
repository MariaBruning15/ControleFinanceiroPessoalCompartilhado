import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import categoriaService from '../../services/CategoriaService';
import './Categorias.css';

function Categorias() {
  const navigate = useNavigate();

  const usuarioNome = localStorage.getItem('usuarioNome') || 'Usuário';
  const usuarioInicial = usuarioNome.charAt(0).toUpperCase();

  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('RECEITA');
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      setCarregando(true);
      const resp = await categoriaService.listar();
      setCategorias(Array.isArray(resp?.data) ? resp.data : []);
    } catch (erro) {
      console.error('Erro ao carregar categorias:', erro);
    } finally {
      setCarregando(false);
    }
  };

  const handleCriarCategoria = async (e) => {
    e.preventDefault();
    setErro('');

    if (!nome.trim()) {
      setErro('Informe um nome para a categoria.');
      return;
    }

    try {
      setSalvando(true);
      await categoriaService.criar({ nome: nome.trim(), tipo });
      setNome('');
      setTipo('RECEITA');
      await carregarCategorias();
    } catch (erroReq) {
      const dadosErro = erroReq.response?.data;
      console.error('Erro ao criar categoria:', dadosErro || erroReq.message);
      setErro(dadosErro?.message || 'Erro ao criar categoria. Verifique os dados e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleRemoverCategoria = async (categoria) => {
    if (!window.confirm(`Remover a categoria "${categoria.nome}"?`)) {
      return;
    }
    try {
      await categoriaService.remover(categoria.id);
      await carregarCategorias();
    } catch (erroReq) {
      const dadosErro = erroReq.response?.data;
      alert(dadosErro?.message || 'Não foi possível remover essa categoria.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const categoriasReceita = categorias.filter((c) => c.tipo === 'RECEITA');
  const categoriasDespesa = categorias.filter((c) => c.tipo === 'DESPESA');

  return (
    <div className="d-flex text-white min-vh-100" style={{ backgroundColor: '#1a1f36' }}>

      <aside className="p-3 border-end border-secondary d-flex flex-column" style={{ width: '240px', backgroundColor: '#141824' }}>
        <h3 className="text-primary font-weight-bold mb-4">Mercúrio</h3>
        <nav className="nav flex-column gap-2">
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button className="btn btn-outline-light text-start w-100" onClick={() => navigate('/dashboard')}>Transações</button>
          <button className="btn btn-primary text-start w-100">Categorias</button>
          <button className="btn btn-outline-light text-start w-100">Perfil</button>
        </nav>
      </aside>

      <main className="flex-grow-1 d-flex flex-column">

        <header className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center" style={{ backgroundColor: '#141824' }}>
          <h4 className="m-0">Categorias</h4>
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
                <h5 className="mb-3">Nova Categoria</h5>
                <form onSubmit={handleCriarCategoria}>
                  <div className="mb-3">
                    <label className="form-label">Nome</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex: Alimentação, Salário..."
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipo</label>
                    <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                      <option value="RECEITA">Receita</option>
                      <option value="DESPESA">Despesa</option>
                    </select>
                  </div>
                  {erro && <div className="text-danger mb-3 small">{erro}</div>}
                  <button type="submit" className="btn btn-primary w-100" disabled={salvando}>
                    {salvando ? 'Salvando...' : 'Adicionar Categoria'}
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-8 mb-4">
              <div className="card text-white p-3 border-0" style={{ backgroundColor: '#232943' }}>
                <h5 className="mb-3">Categorias Cadastradas</h5>
                {carregando ? (
                  <div className="d-flex flex-column align-items-center justify-content-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <p>Carregando categorias...</p>
                  </div>
                ) : categorias.length === 0 ? (
                  <p className="text-muted text-center py-4">Nenhuma categoria cadastrada ainda.</p>
                ) : (
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-success">Receitas</h6>
                      <ul className="list-group list-group-flush mb-3">
                        {categoriasReceita.length === 0 && (
                          <li className="list-group-item bg-transparent text-muted border-secondary px-0">Nenhuma</li>
                        )}
                        {categoriasReceita.map((cat) => (
                          <li key={cat.id} className="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center border-secondary px-0">
                            {cat.nome}
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoverCategoria(cat)}>
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-danger">Despesas</h6>
                      <ul className="list-group list-group-flush mb-3">
                        {categoriasDespesa.length === 0 && (
                          <li className="list-group-item bg-transparent text-muted border-secondary px-0">Nenhuma</li>
                        )}
                        {categoriasDespesa.map((cat) => (
                          <li key={cat.id} className="list-group-item bg-transparent text-white d-flex justify-content-between align-items-center border-secondary px-0">
                            {cat.nome}
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoverCategoria(cat)}>
                              Remover
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Categorias;
