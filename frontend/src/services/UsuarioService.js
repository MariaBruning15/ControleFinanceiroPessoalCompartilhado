import BaseService from "./BaseService";

class UsuarioService extends BaseService {
  constructor() {
    super("/usuario");
  }
}

export default UsuarioService;