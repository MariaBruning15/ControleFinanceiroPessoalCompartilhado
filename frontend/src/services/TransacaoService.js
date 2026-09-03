import BaseService from './BaseService';

class TransacaoService extends BaseService {
  constructor() {
    super('/transacoes');
  }

  async buscarRecentes(limite = 5) {
    const resposta = await this.api.get(`${this.endPoint}/recentes?limite=${limite}`);
    return resposta;
  }

  async buscarDadosGrafico(meses = 6) {
    const resposta = await this.api.get(`${this.endPoint}/grafico-mensal?meses=${meses}`);
    return resposta;
  }

  async buscarResumo() {
    const resposta = await this.api.get(`${this.endPoint}/resumo`);
    return resposta;
  }
}

export default new TransacaoService();