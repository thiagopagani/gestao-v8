import React, { useState, useEffect } from 'react';
import { PaymentBatch, DailyRate, Employee } from '../types';
import { dailyRatesApi, employeesApi } from '../services/api';
import { toast } from 'react-toastify';

interface PaymentBatchFormProps {
  onSave: (batch: Omit<PaymentBatch, 'id'>) => void;
  onCancel: () => void;
}

const PaymentBatchForm: React.FC<PaymentBatchFormProps> = ({ onSave, onCancel }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [availableRates, setAvailableRates] = useState<DailyRate[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const [ratesData, employeesData] = await Promise.all([
                dailyRatesApi.getAll(),
                employeesApi.getAll()
            ]);
            // Filter for approved rates that are not yet in a payment batch
            setAvailableRates(ratesData.filter(r => r.status === 'aprovado' && !r.paymentBatchId));
            setEmployees(employeesData.filter(e => e.status === 'ativo'));
        };
        fetchData();
    }, []);

    const handleEmployeeToggle = (employeeId: number) => {
        setSelectedEmployees(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!startDate || !endDate) {
            toast.warn('Por favor, selecione um período.');
            return;
        }
        
        const filteredRates = availableRates.filter(rate => {
            const rateDate = new Date(rate.data + 'T00:00:00');
            const start = new Date(startDate + 'T00:00:00');
            const end = new Date(endDate + 'T23:59:59');

            const isDateInRange = rateDate >= start && rateDate <= end;
            const isEmployeeSelected = selectedEmployees.length === 0 || selectedEmployees.includes(rate.funcionarioId);
            
            return isDateInRange && isEmployeeSelected;
        });

        if (filteredRates.length === 0) {
            toast.warn('Nenhuma diária aprovada encontrada para os filtros selecionados.');
            return;
        }

        const totalAmount = filteredRates.reduce((sum, rate) => sum + rate.valor_diaria + rate.valor_alimentacao + rate.valor_deslocamento, 0);
        const dailyRateIds = filteredRates.map(rate => rate.id);
        const employeeIds = [...new Set(filteredRates.map(rate => rate.funcionarioId))];

        const newBatch: Omit<PaymentBatch, 'id'> = {
            startDate,
            endDate,
            employeeIds,
            dailyRateIds,
            totalAmount,
            status: 'aberto',
            createdAt: new Date().toISOString()
        };

        onSave(newBatch);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="p-2 border rounded w-full" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="p-2 border rounded w-full" required />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Funcionários (opcional)</label>
                    <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-1">
                        {employees.map(employee => (
                            <div key={employee.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`employee-${employee.id}`}
                                    checked={selectedEmployees.includes(employee.id)}
                                    onChange={() => handleEmployeeToggle(employee.id)}
                                    className="h-4 w-4 text-themeBlue-600 border-gray-300 rounded"
                                />
                                <label htmlFor={`employee-${employee.id}`} className="ml-2 text-sm text-gray-700">{employee.nome}</label>
                            </div>
                        ))}
                    </div>
                     <p className="text-xs text-gray-500 mt-1">Deixe em branco para incluir todos os funcionários.</p>
                </div>
                <p className="text-sm text-gray-600">
                    Isso irá gerar um lote de pagamento para todas as diárias <strong>aprovadas e ainda não pagas</strong> dentro do período e para os funcionários selecionados.
                </p>
            </div>
            <div className="flex justify-end mt-6 space-x-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-themeBlue-600 text-white rounded hover:bg-themeBlue-700">
                    Gerar Lote
                </button>
            </div>
        </form>
    );
};

export default PaymentBatchForm;
