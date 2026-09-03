import { useState } from 'react';
import { Link } from 'react-router-dom';
import CardComponent from '../../components/Card/Card';
import './RecuperarSenha.css';

function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <div className="recuperar-senha-page">
      <CardComponent subtitle="Recuperar Senha">
        {enviado ? (
          /* Mensagem neutra de confirmação após o envio */
          <div className="text-center text-white my-3">
            <p className="mb-4">
              Se o e-mail informado estiver cadastrado em nosso sistema, você receberá as instruções para redefinir sua senha.
            </p>
            <Link to="/" className="btn fs-5">Voltar ao Login</Link>
          </div>
        ) : (
          
          <form onSubmit={handleSubmit} className="d-flex flex-column align-items-center w-100">
            <div className="inputs w-100">
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="floatingEmail"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label htmlFor="floatingEmail">E-mail cadastrado</label>
              </div>
            </div>

            <button type="submit" className="btn btn-custom fs-5">
              Recuperar Senha
            </button>
  
            <div className="cadastro">
              <Link to="/">Voltar ao Login</Link>
            </div>
          </form>
        )}
      </CardComponent>
    </div>
  );
}

export default RecuperarSenha;