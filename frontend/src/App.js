import './App.css'
import Login from './pages/Login/Login'
import Cadastro from './pages/Cadastro/Cadastro'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RecuperarSenha from './pages/RecuperarSenha/RecuperarSenha';
import RedefinirSenha from './pages/RedefinirSenha/RedefinirSenha';
import Dashboard from './pages/Dashboard/Dashboard';
import AlterarSenha from './pages/AlterarSenha/AlterarSenha';
import { PrivateRoute } from './routes/PrivateRouter';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/app/perfil/senha" element={<PrivateRoute><AlterarSenha /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
