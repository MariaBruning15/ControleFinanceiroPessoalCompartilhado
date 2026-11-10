import BaseService from './BaseService';

class CarteiraService extends BaseService {
  constructor() {
    super('/carteiras');
  }

  async listar() {
    return await this.api.get(this.endPoint);
  }

  async criar(dados) {
    return await this.api.post(this.endPoint, dados);
  }

  // ----- Compartilhamento (membros da carteira) -----

  async listarMembros(id) {
    return await this.api.get(`${this.endPoint}/${id}/members`);
  }

  async adicionarMembro(id, email, papel) {
    return await this.api.post(`${this.endPoint}/${id}/members`, { email, papel });
  }

  async alterarPapel(id, usuarioId, papel) {
    return await this.api.patch(`${this.endPoint}/${id}/members/${usuarioId}`, { papel });
  }

  async removerMembro(id, usuarioId) {
    return await this.api.delete(`${this.endPoint}/${id}/members/${usuarioId}`);
  }

  // URL do canal em tempo real (SSE) da carteira.
  // O EventSource não envia cabeçalhos personalizados, então o id do usuário vai na query string.
  urlEventos(id, usuarioId) {
    return `${this.api.defaults.baseURL}${this.endPoint}/${id}/eventos?usuarioId=${encodeURIComponent(usuarioId)}`;
  }

  async remover(id) {
    return await this.api.delete(`${this.endPoint}/${id}`);
  }
}

export default new CarteiraService();
