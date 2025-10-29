
import React, { useState, useEffect } from 'react';
import { DailyRate, Employee, Client } from '../types';
import { employeesApi, clientsApi } from '../services/api';

interface DailyRateFormProps {
  onSave: (rate: Omit<DailyRate, 'id'>) => void;
  onCancel: () => void;
  rate?: DailyRate | null;
}

const DailyRateForm: React.FC<DailyRateFormProps> = ({ onSave, onCancel, rate }) => {
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    funcionarioId: 0,
    clienteId: 0,
    valor_diaria: 0,
    valor_deslocamento: 0,
    valor_alimentacao: 0,
    observacao: '',
    status: 'pendente' as 'pendente' | 'aprovado',
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        const employeesData = await employeesApi.getAll();
        const clientsData = await clientsApi.getAll();
        setEmployees(employeesData);
        setClients(clientsData);
        if (rate) {
          // FIX: The original spread `...rate` caused a type mismatch because the `rate` object contains an `id` field
          // and an optional `observacao`, which are not compatible with the form state. This has been replaced with explicit
          // property assignments to match the state's structure and provide a default value for `observacao`.
          setFormData({
            data: new Date(rate.data).toISOString().split('T')[0],
            funcionarioId: rate.funcionarioId,
            clienteId: rate.clienteId,
            valor_diaria: rate.valor_diaria,
            valor_deslocamento: rate.valor_deslocamento,
            valor_alimentacao: rate.valor_alimentacao,
            status: rate.status,
            observacao: rate.observacao || '',
          });
        } else if (employeesData.length > 0 && clientsData.length > 0) {
            setFormData(prev => ({
                ...prev,
                funcionarioId: employeesData[0]?.id || 0,
                clienteId: clientsData[0]?.id || 0,
            }));
        }
    }
    fetchData();
  }, [rate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = ['funcionarioId', 'clienteId', 'valor_diaria', 'valor_deslocamento', 'valor_alimentacao'].includes(name);
    setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input name="data" value={formData.data} onChange={handleChange} type="date" className="p-2 border rounded" required />
        <select name="status" value={formData.status} onChange={handleChange} className="p-2 border rounded">
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
        </select>
        <select name="funcionarioId" value={formData.funcionarioId} onChange={handleChange} className="p-2 border rounded col-span-2" required>
            <option value="">Selecione o Funcionário</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
        </select>
        <select name="clienteId" value={formData.clienteId} onChange={handleChange} className="p-2 border rounded col-span-2" required>
            <option value="">Selecione o Cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <input name="valor_diaria" value={formData.valor_diaria} onChange={handleChange} placeholder="Valor Diária" type="number" step="0.01" className="p-2 border rounded" required />
        <input name="valor_deslocamento" value={formData.valor_deslocamento} onChange={handleChange} placeholder="Valor Deslocamento" type="number" step="0.01" className="p-2 border rounded" />
        <input name="valor_alimentacao" value={formData.valor_alimentacao} onChange={handleChange} placeholder="Valor Alimentação" type="number" step="0.01" className="p-2 border rounded" />
        <textarea name="observacao" value={formData.observacao} onChange={handleChange} placeholder="Observação" className="p-2 border rounded col-span-2" />
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

export default DailyRateForm;
