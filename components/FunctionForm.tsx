
import React, { useState, useEffect } from 'react';
import { Func } from '../types';

interface FunctionFormProps {
  onSave: (func: Omit<Func, 'id'>) => void;
  onCancel: () => void;
  func?: Func | null;
}

const FunctionForm: React.FC<FunctionFormProps> = ({ onSave, onCancel, func }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    status: 'ativo' as 'ativo' | 'inativo',
  });

  useEffect(() => {
    if (func) {
      setFormData({
        nome: func.nome,
        descricao: func.descricao || '',
        status: func.status,
      });
    }
  }, [func]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4">
        <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome da Função" className="p-2 border rounded" required />
        <textarea name="descricao" value={formData.descricao} onChange={handleChange} placeholder="Descrição" className="p-2 border rounded" />
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

export default FunctionForm;
