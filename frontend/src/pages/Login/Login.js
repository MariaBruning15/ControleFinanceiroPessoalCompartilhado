import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CardComponent from '../../components/Card/Card';
import authService from '../../services/AuthService';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErro(err.response.data.message);
      } else {
        setErro('E-mail ou senha inválidos. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-page">
      <CardComponent subtitle="Login">
        <form className="d-flex flex-column align-items-center" onSubmit={handleSubmit}>
          <div className="inputs w-100">
            {erro && <div className="alert alert-danger text-center p-2 mb-3">{erro}</div>}

            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                id="floatingInput"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="floatingInput">Email</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="password"
                className="form-control"
                id="floatingPassword"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="floatingPassword">Senha</label>
            </div>

            <Link to="/recuperar-senha" className="esqueci-senha-link">
              Esqueceu sua senha?
            </Link>
          </div>

          <button type="submit" className="btn btn-custom fs-5 w-50" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Login'}
          </button>

          <div className="cadastro mt-3">
            <p>Não tem uma conta?</p>
            <Link to="/cadastro" className="cadastre-link">Cadastre-se</Link>
          </div>
        </form>
      </CardComponent>
    </div>
  );
}

export default Login;