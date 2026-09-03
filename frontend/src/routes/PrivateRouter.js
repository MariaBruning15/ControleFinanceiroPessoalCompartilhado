import { Navigate } from 'react-router-dom';

export function PrivateRoute({ children }) {
  const isAuthenticated = Boolean(localStorage.getItem('token')); 

  return isAuthenticated ? children : <Navigate to="/" replace />;
}