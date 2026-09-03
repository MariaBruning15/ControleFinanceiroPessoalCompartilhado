import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CardComponent from '../../components/Card/Card';
import authService from '../../services/AuthService';
import './Cadastro.css';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    // Validação para checar se as senhas são iguais
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);

    try {
      // Chama o serviço de cadastro herdado do BaseService
      await authService.cadastrar(nome, email, senha);
      
      // Redireciona para a tela de login após o cadastro com sucesso
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErro(err.response.data.message);
      } else {
        setErro('Erro ao realizar o cadastro. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="cadastro-page">
      <CardComponent subtitle="Cadastro">
        <form onSubmit={handleSubmit} className="w-100 d-flex flex-column align-items-center">
          <div className="inputs w-100">
            {erro && <div className="alert alert-danger text-center p-2 mb-3">{erro}</div>}

            <div className="form-floating mb-3 w-100">
              <input
                type="text"
                className="form-control"
                id="floatingName"
                placeholder="Seu Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
              <label htmlFor="floatingName">Nome Completo</label>
            </div>

            <div className="form-floating mb-3 w-100">
              <input
                type="email"
                className="form-control"
                id="floatingEmail"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="floatingEmail">E-mail</label>
            </div>

            <div className="form-floating mb-3 w-100">
              <input
                type="password"
                className="form-control"
                id="floatingPassword"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
              <label htmlFor="floatingPassword">Senha</label>
            </div>

            <div className="form-floating mb-3 w-100">
              <input
                type="password"
                className="form-control"
                id="floatingConfirmPassword"
                placeholder="Confirmar Senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
              <label htmlFor="floatingConfirmPassword">Confirmar Senha</label>
            </div>
          </div>

          <button type="submit" className="btn btn-custom fs-5 w-50" disabled={carregando}>
            {carregando ? 'Cadastrando...' : 'Cadastrar'}
          </button>

          <div className="cadastro mt-3">
            <p>Já possui uma conta?</p>
            <Link to="/">Fazer Login</Link>
          </div>
        </form>
      </CardComponent>
    </div>
  );
}

export default Cadastro;