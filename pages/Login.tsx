import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@gestao.com');
  const [password, setPassword] = useState('admin123');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic. In a real app, this would be an API call.
    if (email === 'admin@gestao.com' && password === 'admin123') {
      login({ id: 1, nome: 'Admin', email: 'admin@gestao.com', role: 'admin', status: 'ativo' });
      toast.success('Login bem-sucedido!');
      navigate('/');
    } else if (email === 'operador@gestao.com' && password === 'operador123') {
      login({ id: 2, nome: 'Operador', email: 'operador@gestao.com', role: 'operador', status: 'ativo' });
      toast.success('Login bem-sucedido!');
      navigate('/');
    }
    else {
      toast.error('Credenciais inválidas.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-themeBlue-700">Gestão de Terceiros</h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-themeBlue-500 focus:border-themeBlue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-themeBlue-500 focus:border-themeBlue-500"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-themeBlue-600 rounded-md hover:bg-themeBlue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-themeBlue-500"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;