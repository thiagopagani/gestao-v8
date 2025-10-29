import React, { useState, useEffect, useRef } from 'react';
import { Employee, Func } from '../types';
import { funcsApi } from '../services/api';
import IMask from 'imask';

interface EmployeeFormProps {
  onSave: (employee: Omit<Employee, 'id'>) => void;
  onCancel: () => void;
  employee?: Employee | null;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSave, onCancel, employee }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    funcaoId: 0,
    observacoes: '',
    status: 'ativo' as 'ativo' | 'inativo',
  });
  const [funcs, setFuncs] = useState<Func[]>([]);

  const cpfRef = useRef<HTMLInputElement>(null);
  const telRef = useRef<HTMLInputElement>(null);
  const cepRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cpfRef.current && telRef.current && cepRef.current) {
        const masks = [
            IMask(cpfRef.current, { mask: '000.000.000-00' }),
            IMask(telRef.current, { mask: '(00) 00000-0000' }),
            IMask(cepRef.current, { mask: '00000-000' })
        ];
        return () => masks.forEach(m => m.destroy());
    }
  }, []);

  useEffect(() => {
    const fetchFuncs = async () => {
      const funcsData = await funcsApi.getAll();
      setFuncs(funcsData);
      
      if (employee) {
        setFormData({
            nome: employee.nome,
            cpf: employee.cpf,
            email: employee.email,
            telefone: employee.telefone,
            endereco: employee.endereco,
            cidade: employee.cidade,
            estado: employee.estado,
            cep: employee.cep,
            funcaoId: employee.funcaoId,
            observacoes: employee.observacoes || '',
            status: employee.status,
        });
      } else if (funcsData.length > 0) {
        setFormData(prev => ({ ...prev, funcaoId: funcsData[0].id }));
      }
    };

    fetchFuncs();
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = name === 'funcaoId';
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
            <input name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome do Funcionário" className="p-2 border rounded w-full" required />
        </div>
        
        <input ref={cpfRef} name="cpf" value={formData.cpf} onChange={handleChange} placeholder="CPF" className="p-2 border rounded" required />
        
        <select id="funcaoId" name="funcaoId" value={formData.funcaoId} onChange={handleChange} className="p-2 border rounded w-full" required>
          <option value="">Selecione a Função</option>
          {funcs.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
        </select>
        
        <div className="col-span-2">
          <input name="endereco" value={formData.endereco} onChange={handleChange} placeholder="Endereço" className="p-2 border rounded w-full" required />
        </div>
        
        <input name="cidade" value={formData.cidade} onChange={handleChange} placeholder="Cidade" className="p-2 border rounded" required />
        <input name="estado" value={formData.estado} onChange={handleChange} placeholder="Estado" className="p-2 border rounded" required />
        <input ref={cepRef} name="cep" value={formData.cep} onChange={handleChange} placeholder="CEP" className="p-2 border rounded" required />
        <input ref={telRef} name="telefone" value={formData.telefone} onChange={handleChange} placeholder="Telefone" className="p-2 border rounded" />
        
        <div className="col-span-2">
          <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" className="p-2 border rounded w-full" required />
        </div>

        <div className="col-span-2">
            <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} placeholder="Observações" className="p-2 border rounded w-full" />
        </div>
        
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

export default EmployeeForm;