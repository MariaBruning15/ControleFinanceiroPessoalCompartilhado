import BaseService from './BaseService';

class UsuarioService extends BaseService {
  constructor() {
    super('/usuarios');
  }

  async buscarPerfil() {
    const resposta = await this.api.get(`${this.endPoint}/me`);
    return resposta;
  }

  async solicitarRecuperacaoSenha(email) {
    const resposta = await this.api.post(`${this.endPoint}/esqueci-senha`, { email });
    return resposta;
  }

  async redefinirSenha(token, novaSenha) {
    const resposta = await this.api.post(`${this.endPoint}/redefinir-senha`, {
      token,
      novaSenha
    });
    return resposta;
  }

  async alterarSenha(senhaAtual, novaSenha) {
    const resposta = await this.api.put(`${this.endPoint}/alterar-senha`, {
      senhaAtual,
      novaSenha
    });
    return resposta;
  }
}

export default new UsuarioService();