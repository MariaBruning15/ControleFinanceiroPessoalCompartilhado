import { Link } from 'react-router-dom';
import './Cadastro.css';
import CardComponent from '../../components/Card/Card';

function Cadastro() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="cadastro-page">
      <CardComponent subtitle="Cadastro">
        <form onSubmit={handleSubmit} className="w-100 d-flex flex-column align-items-center">
          <div className="inputs">

            <div className="form-floating mb-3 w-100">
              <input type="text" className="form-control" id="floatingName" placeholder="Seu Nome" required />
              <label htmlFor="floatingName">Nome Completo</label>
            </div>

            <div className="form-floating mb-3 w-100">
              <input type="email" className="form-control" id="floatingEmail" placeholder="name@example.com" required />
              <label htmlFor="floatingEmail">E-mail</label>
            </div>

            <div className="form-floating mb-3 w-100">
              <input type="password" className="form-control" id="floatingPassword" placeholder="Senha" required />
              <label htmlFor="floatingPassword">Senha</label>
            </div>

            <div className="form-floating mb-3 w-100">
              <input type="password" className="form-control" id="floatingConfirmPassword" placeholder="Confirmar Senha" required />
              <label htmlFor="floatingConfirmPassword">Confirmar Senha</label>
            </div>
          </div>

          <button type="submit" className="btn btn-custom fs-5 w-50">
            Cadastrar
          </button>

          <div className="cadastro">
            <p>Já possui uma conta?</p>
            <Link to="/">Fazer Login</Link>
          </div>
        </form>
      </CardComponent>
    </div>
  );
}

export default Cadastro;