import React, { useState, useEffect, useRef } from 'react';
import { Company } from '../types';
import IMask from 'imask';

interface CompanyFormProps {
  onSave: (company: Omit<Company, 'id'>) => void;
  onCancel: () => void;
  company?: Company | null;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ onSave, onCancel, company }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cep: '',
    cidade: '',
    estado: '',
    status: 'ativo' as 'ativo' | 'inativo',
  });
  
  const cnpjRef = useRef<HTMLInputElement>(null);
  const telRef = useRef<HTMLInputElement>(null);
  const cepRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cnpjRef.current && telRef.current && cepRef.current) {
        const masks = [
            IMask(cnpjRef.current, { mask: '00.000.000/0000-00' }),
            IMask(telRef.current, { mask: '(00) 00000-0000' }),
            IMask(cepRef.current, { mask: '00000-000' })
        ];
        return () => masks.forEach(m => m.destroy());
    }
  }, []);

  useEffect(() => {
    if (company) {
      setFormData({
        nome: company.nome,
        cpf_cnpj: company.cpf_cnpj,
        telefone: company.telefone,
        email: company.email,
        endereco: company.endereco || '',
        cep: company.cep || '',
        cidade: company.cidade || '',
        estado: company.estado || '',
        status: company.status,
      });
    }
  }, [company]);

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
        <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome da Empresa" className="p-2 border rounded col-span-2" required />
        <input ref={cnpjRef} name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} placeholder="CNPJ" className="p-2 border rounded" required />
        <input ref={telRef} name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" className="p-2 border rounded" />
        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" className="p-2 border rounded col-span-2" required />
        <input name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Endereço" className="p-2 border rounded col-span-2" />
        <input ref={cepRef} name="cep" value={formData.cep} onChange={handleChange} placeholder="CEP" className="p-2 border rounded" />
        <input name="cidade" value={formData.cidade} onChange={handleChange} placeholder="Cidade" className="p-2 border rounded" />
        <input name="estado" value={formData.estado} onChange={handleChange} placeholder="Estado" className="p-2 border rounded" />
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

export default CompanyForm;