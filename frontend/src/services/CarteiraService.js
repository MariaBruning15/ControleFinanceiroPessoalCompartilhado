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
}

export default new CarteiraService();
