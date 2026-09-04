import BaseService from './BaseService';

class CategoriaService extends BaseService {
  constructor() {
    super('/categorias');
  }

  async listar(tipo = '') {
    const url = tipo ? `${this.endPoint}?type=${tipo}` : this.endPoint;
    return await this.api.get(url);
  }

  async criar(dados) {
    return await this.api.post(this.endPoint, dados);
  }

  async remover(id) {
    return await this.api.delete(`${this.endPoint}/${id}`);
  }
}

export default new CategoriaService();
