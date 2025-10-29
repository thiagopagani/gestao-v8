
import React, { useState, useEffect, useRef } from 'react';
import { Client, Company } from '../types';
import { companiesApi } from '../services/api';
import IMask from 'imask';

interface ClientFormProps {
  onSave: (client: Omit<Client, 'id'>) => void;
  onCancel: () => void;
  client?: Client | null;
}

const ClientForm: React.FC<ClientFormProps> = ({ onSave, onCancel, client }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    cep: '',
    cidade: '',
    estado: '',
    empresaId: 0,
    status: 'ativo' as 'ativo' | 'inativo',
  });
  const [companies, setCompanies] = useState<Company[]>([]);

  const cpfCnpjRef = useRef<HTMLInputElement>(null);
  const telRef = useRef<HTMLInputElement>(null);
  const cepRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cpfCnpjRef.current && telRef.current && cepRef.current) {
        const masks = [
            IMask(cpfCnpjRef.current, {
                mask: [
                    { mask: '000.000.000-00', maxLength: 11 },
                    { mask: '00.000.000/0000-00' }
                ]
            }),
            IMask(telRef.current, { mask: '(00) 00000-0000' }),
            IMask(cepRef.current, { mask: '00000-000' })
        ];
        return () => masks.forEach(m => m.destroy());
    }
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      const companiesData = await companiesApi.getAll();
      setCompanies(companiesData);
      
      if (client) {
        setFormData({
            nome: client.nome,
            cpf_cnpj: client.cpf_cnpj,
            email: client.email,
            telefone: client.telefone,
            endereco: client.endereco || '',
            cep: client.cep || '',
            cidade: client.cidade || '',
            estado: client.estado || '',
            empresaId: client.empresaId,
            status: client.status,
        });
      } else if (companiesData.length > 0) {
        setFormData(prev => ({ ...prev, empresaId: companiesData[0].id }));
      }
    };

    fetchCompanies();
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = name === 'empresaId';
    setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2">
            <label htmlFor="empresaId" className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <select id="empresaId" name="empresaId" value={formData.empresaId} onChange={handleChange} className="p-2 border rounded w-full" required>
              <option value="">Selecione a Empresa</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
        </div>
        <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome do Cliente" className="p-2 border rounded" required />
        <input ref={cpfCnpjRef} name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} placeholder="CPF/CNPJ" className="p-2 border rounded" required />
        <input ref={telRef} name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" className="p-2 border rounded" />
        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" className="p-2 border rounded" required />
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

export default ClientForm;