
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface UserFormProps {
  onSave: (user: Omit<User, 'id'>) => void;
  onCancel: () => void;
  user?: User | null;
}

const UserForm: React.FC<UserFormProps> = ({ onSave, onCancel, user }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    role: 'operador' as 'admin' | 'operador',
    status: 'ativo' as 'ativo' | 'inativo',
  });

  useEffect(() => {
    if (user) {
      // FIX: Assigning `user` directly to `formData` is unsafe as it includes the `id` property, which is not part of the `formData` state.
      // Explicitly map properties to ensure type compatibility.
      setFormData({
        nome: user.nome,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome" className="p-2 border rounded" required />
        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" className="p-2 border rounded" required />
        <select name="role" value={formData.role} onChange={handleChange} className="p-2 border rounded">
          <option value="operador">Operador</option>
          <option value="admin">Admin</option>
        </select>
        <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded">
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>
      <div className="flex justify-end mt-6 space-x-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 bg-themeBlue-600 text-white rounded hover:bg-themeBlue-700">
          Salvar
        </button>
      </div>
    </form>
  );
};

export default UserForm;
