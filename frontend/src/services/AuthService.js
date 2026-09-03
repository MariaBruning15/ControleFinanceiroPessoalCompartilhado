import BaseService from './BaseService';

class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  async login(email, senha) {
    const resposta = await this.api.post(`${this.endPoint}/login`, { email, senha });
    if (resposta.data && resposta.data.accessToken) {
      localStorage.setItem('token', resposta.data.accessToken);
    }
    return resposta;
  }

  async cadastrar(nome, email, senha) {
    const resposta = await this.api.post(`${this.endPoint}/register`, { 
      nome: nome, 
      email: email, 
      senha: senha 
    });
    return resposta;
  }
}

export default new AuthService();