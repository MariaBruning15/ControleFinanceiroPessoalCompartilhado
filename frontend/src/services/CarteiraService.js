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

  async remover(id) {
    return await this.api.delete(`${this.endPoint}/${id}`);
  }
}

export default new CarteiraService();
