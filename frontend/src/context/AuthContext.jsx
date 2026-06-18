import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [cliente, setCliente] = useState(() => {
    const saved = localStorage.getItem('tr_cliente');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('tr_token', data.access_token);
    localStorage.setItem('tr_cliente', JSON.stringify(data.cliente));
    setCliente(data.cliente);
    return data.cliente;
  }, []);

  const register = useCallback(async (nombre, email, telefono, password) => {
    await api.post('/auth/register', { nombre, email, telefono, password });
    return login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('tr_token');
    localStorage.removeItem('tr_cliente');
    setCliente(null);
  }, []);

  return (
    <AuthContext.Provider value={{ cliente, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
