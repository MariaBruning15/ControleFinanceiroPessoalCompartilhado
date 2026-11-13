import { useState } from 'react';
import { Link } from 'react-router-dom';
import CardComponent from '../../components/Card/Card';
import usuarioService from '../../services/UsuarioService';
import './RecuperarSenha.css';

function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await usuarioService.solicitarRecuperacaoSenha(email);
      setEnviado(true);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErro(err.response.data.message);
      } else {
        setErro('Ocorreu um erro ao processar sua solicitação. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="recuperar-senha-page auth-background">
      <CardComponent subtitle="Recuperar Senha">
        {enviado ? (
          <div className="text-center text-white my-3">
            <p className="mb-4">
            </p>
            <Link to="/" className="btn btn-custom fs-5">Voltar ao Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="d-flex flex-column align-items-center w-100">
            {erro && (
              <div className="alert alert-danger py-2 text-center fs-6 mb-3 w-85">
                {erro}
              </div>
            )}

            <div className="inputs w-100">
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="floatingEmail"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErro('');
                  }}
                  required
                />
                <label htmlFor="floatingEmail">E-mail cadastrado</label>
              </div>
            </div>

            <button type="submit" className="btn btn-custom fs-5" disabled={carregando}>
              {carregando ? 'Enviando...' : 'Recuperar Senha'}
            </button>
  
            <div className="cadastro mt-3">
              <Link to="/">Voltar ao Login</Link>
            </div>
          </form>
        )}
      </CardComponent>
    </div>
  );
}

export default RecuperarSenha;