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
      // Chama o método no UsuarioService que faz a requisição POST para o backend
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
    <div className="recuperar-senha-page">
      <CardComponent subtitle="Recuperar Senha">
        {enviado ? (
          /* Mensagem neutra de confirmação após o envio bem-sucedido */
          <div className="text-center text-white my-3">
            <p className="mb-4">
              Se o e-mail informado estiver cadastrado em nosso sistema, você receberá as instruções para redefinir sua senha.
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