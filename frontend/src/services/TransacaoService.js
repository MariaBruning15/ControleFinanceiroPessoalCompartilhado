import BaseService from './BaseService';

class TransacaoService extends BaseService {
  constructor() {
    super('/carteiras');
  }

  async obterResumoDashboard(walletId, startDate = '', endDate = '') {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const url = `${this.endPoint}/${walletId}/transacoes/resumo-dashboard?${params.toString()}`;
    return await this.api.get(url);
  }

  async listarRecentes(walletId, page = 0, size = 5) {
    const url = `${this.endPoint}/${walletId}/transacoes?page=${page}&size=${size}&sort=data,desc`;
    return await this.api.get(url);
  }

  async listar(walletId, page = 0, size = 10, filtros = {}) {
    const params = new URLSearchParams({ page, size, sort: 'data,desc' });
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.categoryId) params.append('categoryId', filtros.categoryId);
    if (filtros.startDate) params.append('startDate', filtros.startDate);
    if (filtros.endDate) params.append('endDate', filtros.endDate);

    const url = `${this.endPoint}/${walletId}/transacoes?${params.toString()}`;
    return await this.api.get(url);
  }

  async remover(walletId, transacaoId) {
    const url = `${this.endPoint}/${walletId}/transacoes/${transacaoId}`;
    return await this.api.delete(url);
  }

  async criarTransacao(walletId, transacaoDTO) {
    const url = `${this.endPoint}/${walletId}/transacoes`;
    return await this.api.post(url, transacaoDTO);
  }
}

export default new TransacaoService();