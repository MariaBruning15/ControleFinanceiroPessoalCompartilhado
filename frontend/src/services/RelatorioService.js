import BaseService from './BaseService';

class RelatorioService extends BaseService {
  constructor() {
    super('/carteiras');
  }

  // mes no formato "yyyy-MM" (ex.: "2026-11"); sem mes o backend usa o mês atual
  async resumoMensal(walletId, mes) {
    const query = mes ? `?mes=${encodeURIComponent(mes)}` : '';
    return await this.api.get(`${this.endPoint}/${walletId}/relatorios/mensal${query}`);
  }
}

export default new RelatorioService();
