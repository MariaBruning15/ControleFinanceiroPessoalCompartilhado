import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CardComponent from '../../components/Card/Card';
import './RedefinirSenha.css';

function RedefinirSenha() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');

  // Validação do token vindo da URL (/redefinir-senha/:token)
  const isTokenValido = Boolean(token);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem!');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    // Redireciona para o login com mensagem de confirmação
    navigate('/', { state: { mensagemSucesso: 'Senha redefinida com sucesso!' } });
  };

  return (
    <div className="redefinir-senha-page">
      <CardComponent subtitle="Redefinir Senha">
        {!isTokenValido ? (
          <div className="text-center text-white my-3 d-flex flex-column align-items-center">
            <p className="text-warning mb-4">Token de redefinição ausente ou inválido.</p>
            <Link to="/recuperar-senha" className="esqueci-senha-link">
              Solicitar novamente
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="d-flex flex-column align-items-center w-100">
            {erro && <div className="alert alert-danger py-2 text-center fs-6 mb-3 w-85">{erro}</div>}

            <div className="inputs w-100">
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="floatingNovaSenha"
                  placeholder="Nova Senha"
                  value={novaSenha}
                  onChange={(e) => {
                    setNovaSenha(e.target.value);
                    setErro('');
                  }}
                  required
                />
                <label htmlFor="floatingNovaSenha">Nova Senha</label>
              </div>

              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="floatingConfirmarSenha"
                  placeholder="Confirmar Nova Senha"
                  value={confirmarSenha}
                  onChange={(e) => {
                    setConfirmarSenha(e.target.value);
                    setErro('');
                  }}
                  required
                />
                <label htmlFor="floatingConfirmarSenha">Confirmar Nova Senha</label>
              </div>
            </div>

            <button type="submit" className="btn btn-custom fs-5">
              Salvar Nova Senha
            </button>

            <div className="cadastro">
              <Link to="/">Cancelar e Voltar</Link>
            </div>
          </form>
        )}
      </CardComponent>
    </div>
  );
}

export default RedefinirSenha;