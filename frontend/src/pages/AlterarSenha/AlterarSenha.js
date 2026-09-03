import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardComponent from '../../components/Card/Card';
import usuarioService from '../../services/UsuarioService';
import './AlterarSenha.css';

function AlterarSenha() {
  const navigate = useNavigate();

  // Estados dos campos de formulário
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  // Estados de erro, carregamento e sucesso
  const [erroGeral, setErroGeral] = useState('');
  const [erroSenhaAtual, setErroSenhaAtual] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroGeral('');
    setErroSenhaAtual('');

    // 1. Validação de critérios da Nova Senha (mínimo 6 caracteres)
    if (novaSenha.length < 6) {
      setErroGeral('A nova senha deve conter no mínimo 6 caracteres.');
      return;
    }

    // 2. Validação de coincidência entre as senhas
    if (novaSenha !== confirmarSenha) {
      setErroGeral('A confirmação não coincide com a nova senha.');
      return;
    }

    setCarregando(true);

    try {
      // Chama o método no UsuarioService estendido do BaseService
      await usuarioService.alterarSenha(senhaAtual, novaSenha);
      setSucesso(true);
    } catch (err) {
      if (err.response) {
        // Se a API retornar erro de validação da senha atual (ex.: 400 Bad Request)
        if (err.response.status === 400 && err.response.data?.message?.toLowerCase().includes('senha')) {
          setErroSenhaAtual(err.response.data.message || 'A senha atual está incorreta.');
        } else {
          setErroGeral(err.response.data?.message || 'Erro ao alterar a senha. Tente novamente.');
        }
      } else {
        setErroGeral('Não foi possível se conectar ao servidor.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="alterar-senha-page">
      <CardComponent subtitle="Alterar Senha">
        {sucesso ? (
          <div className="text-center text-white my-3 d-flex flex-column align-items-center">
            <p className="text-success mb-4 fs-5 fw-bold">
              Senha alterada com sucesso!
            </p>
            <button 
              className="btn btn-custom fs-5"
              onClick={() => navigate('/dashboard')}
            >
              Voltar ao Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="d-flex flex-column align-items-center w-100">
            {erroGeral && (
              <div className="alert alert-danger py-2 text-center fs-6 mb-3 w-85">
                {erroGeral}
              </div>
            )}

            <div className="inputs w-100">
              {/* Campo Senha Atual */}
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className={`form-control ${erroSenhaAtual ? 'is-invalid' : ''}`}
                  id="floatingSenhaAtual"
                  placeholder="Senha Atual"
                  value={senhaAtual}
                  onChange={(e) => {
                    setSenhaAtual(e.target.value);
                    setErroSenhaAtual('');
                    setErroGeral('');
                  }}
                  required
                />
                <label htmlFor="floatingSenhaAtual">Senha Atual</label>
                {erroSenhaAtual && (
                  <div className="invalid-feedback text-center mt-1">
                    {erroSenhaAtual}
                  </div>
                )}
              </div>

              {/* Campo Nova Senha */}
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="floatingNovaSenha"
                  placeholder="Nova Senha"
                  value={novaSenha}
                  onChange={(e) => {
                    setNovaSenha(e.target.value);
                    setErroGeral('');
                  }}
                  required
                />
                <label htmlFor="floatingNovaSenha">Nova Senha</label>
              </div>

              {/* Campo Confirmar Nova Senha */}
              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control"
                  id="floatingConfirmarSenha"
                  placeholder="Confirmar Nova Senha"
                  value={confirmarSenha}
                  onChange={(e) => {
                    setConfirmarSenha(e.target.value);
                    setErroGeral('');
                  }}
                  required
                />
                <label htmlFor="floatingConfirmarSenha">Confirmar Nova Senha</label>
              </div>
            </div>

            <button type="submit" className="btn btn-custom fs-5" disabled={carregando}>
              {carregando ? 'Salvando...' : 'Salvar Senha'}
            </button>

            <div className="cadastro mt-2">
              <button 
                type="button" 
                className="btn-link-style" 
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </CardComponent>
    </div>
  );
}

export default AlterarSenha;