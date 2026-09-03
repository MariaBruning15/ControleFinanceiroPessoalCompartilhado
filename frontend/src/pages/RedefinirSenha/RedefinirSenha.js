import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import CardComponent from '../../components/Card/Card';
import usuarioService from '../../services/UsuarioService';
import './RedefinirSenha.css';

function RedefinirSenha() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Validação para garantir que o token está presente na URL (/redefinir-senha/:token)
  const isTokenValido = Boolean(token);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem!');
      return;
    }

    if (novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setCarregando(true);

    try {
      // Chama o método no UsuarioService que envia o token e a nova senha para a API
      await usuarioService.redefinirSenha(token, novaSenha);

      // Redireciona para o login informando o sucesso via navegação
      navigate('/', { state: { mensagemSucesso: 'Senha redefinida com sucesso!' } });
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErro(err.response.data.message);
      } else {
        setErro('Erro ao redefinir a senha ou o token expirou. Tente solicitar novamente.');
      }
    } finally {
      setCarregando(false);
    }
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

            <button type="submit" className="btn btn-custom fs-5" disabled={carregando}>
              {carregando ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>

            <div className="cadastro mt-3">
              <Link to="/">Cancelar e Voltar</Link>
            </div>
          </form>
        )}
      </CardComponent>
    </div>
  );
}

export default RedefinirSenha;