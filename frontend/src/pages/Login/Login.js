import './Login.css';
import CardComponent from '../../components/Card/Card';
import { Link } from 'react-router-dom';

function Login() {
  return (
    <div className="login-page">
      <CardComponent subtitle="Login">
        <form className="d-flex flex-column align-items-center">
          <div className="inputs">
            <div className="form-floating mb-3">
              <input type="email" className="form-control" id="floatingInput" placeholder="name@example.com" />
              <label htmlFor="floatingInput">Email</label>
            </div>

            <div className="form-floating mb-3">
              <input type="password" className="form-control" id="floatingPassword" placeholder="Password" />
              <label htmlFor="floatingPassword">Senha</label>
            </div>
            
            <Link to="/recuperar-senha" className="esqueci-senha-link">
              Esqueceu sua senha?
            </Link>
          </div>

          <button type="submit" className="btn btn-custom fs-5 w-50">
            Login
          </button>

          <div className="cadastro">
            <p>Não tem uma conta?</p>
            <Link to="/cadastro" className="cadastre-link">Cadastre-se</Link>
          </div>
        </form>
      </CardComponent>
    </div>
  );
}

export default Login;