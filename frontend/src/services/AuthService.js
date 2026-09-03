import BaseService from './BaseService';

class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  async login(email, password) {
    const resposta = await this.api.post(`${this.endPoint}/login`, { email, password });
    
    if (resposta.data && resposta.data.accessToken) {
      localStorage.setItem('token', resposta.data.accessToken);
    }
    
    return resposta;
  }

  async cadastrar(name, email, password) {
    const resposta = await this.api.post(`${this.endPoint}/register`, { name, email, password });
    return resposta;
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

export default new AuthService();