import React, { useState, useEffect } from 'react';
import { PaymentBatch, DailyRate, Employee } from '../types';
import { paymentBatchesApi, dailyRatesApi, employeesApi } from '../services/api';
import Modal from '../components/Modal';
import PaymentBatchForm from '../components/PaymentBatchForm';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-toastify';
import { FaEye, FaPlus, FaTrash, FaCheck } from 'react-icons/fa';

const Pagamentos: React.FC = () => {
    const [batches, setBatches] = useState<PaymentBatch[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [dailyRates, setDailyRates] = useState<DailyRate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<PaymentBatch | null>(null);
    const [batchToDelete, setBatchToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [batchesData, employeesData, ratesData] = await Promise.all([
                paymentBatchesApi.getAll(),
                employeesApi.getAll(),
                dailyRatesApi.getAll(),
            ]);
            setBatches(batchesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setEmployees(employeesData);
            setDailyRates(ratesData);
        } catch (error) {
            toast.error("Falha ao carregar dados de pagamentos.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const getEmployeeNames = (ids: number[]) => {
        const names = ids.map(id => employees.find(e => e.id === id)?.nome || 'N/A');
        if (names.length > 2) {
            return `${names[0]}, ${names[1]} e mais ${names.length - 2}`;
        }
        return names.join(', ');
    }

    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR', {timeZone: 'UTC'});

    const handleSave = async (batchData: Omit<PaymentBatch, 'id'>) => {
        try {
            const newBatch = await paymentBatchesApi.create(batchData);
            
            // Update daily rates to link them to the batch
            for (const rateId of newBatch.dailyRateIds) {
                await dailyRatesApi.update(rateId, { paymentBatchId: newBatch.id });
            }

            toast.success('Lote de pagamento criado com sucesso!');
            fetchData();
            closeFormModal();
        } catch (error) {
            toast.error('Erro ao criar lote de pagamento.');
        }
    };
    
    const handleDeleteRequest = (id: string) => {
        setBatchToDelete(id);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (batchToDelete) {
            try {
                const batch = batches.find(b => b.id === batchToDelete);
                if (batch) {
                    for (const rateId of batch.dailyRateIds) {
                       await dailyRatesApi.update(rateId, { paymentBatchId: null });
                    }
                }
                await paymentBatchesApi.remove(batchToDelete);
                toast.success('Lote de pagamento excluído com sucesso!');
                fetchData();
            } catch (error) {
                toast.error('Erro ao excluir lote de pagamento.');
            } finally {
                closeConfirmModal();
            }
        }
    };

    const handleMarkAsPaid = async (batchId: string) => {
        try {
            await paymentBatchesApi.update(batchId, { status: 'pago' });
            toast.success('Lote marcado como pago!');
            fetchData();
        } catch (error) {
            toast.error('Erro ao marcar lote como pago.');
        }
    }

    const openFormModal = () => setIsFormModalOpen(true);
    const closeFormModal = () => setIsFormModalOpen(false);

    const openDetailModal = (batch: PaymentBatch) => {
        setSelectedBatch(batch);
        setIsDetailModalOpen(true);
    };
    const closeDetailModal = () => {
        setSelectedBatch(null);
        setIsDetailModalOpen(false);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setBatchToDelete(null);
    };
    
    const DetailModalContent = () => {
        if (!selectedBatch) return null;
        const batchRates = dailyRates.filter(r => selectedBatch.dailyRateIds.includes(r.id));
        
        return (
            <div>
                <p><strong>Período:</strong> {formatDate(selectedBatch.startDate)} a {formatDate(selectedBatch.endDate)}</p>
                <p><strong>Funcionários:</strong> {selectedBatch.employeeIds.map(id => employees.find(e => e.id === id)?.nome).join(', ')}</p>
                <p><strong>Total:</strong> {formatCurrency(selectedBatch.totalAmount)}</p>
                <p><strong>Status:</strong> {selectedBatch.status}</p>
                
                <h4 className="font-bold mt-4 mb-2">Diárias Incluídas:</h4>
                 <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left">Data</th>
                                <th className="p-2 text-left">Funcionário</th>
                                <th className="p-2 text-left">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {batchRates.map(rate => (
                                <tr key={rate.id} className="border-b">
                                    <td className="p-2">{formatDate(rate.data)}</td>
                                    <td className="p-2">{employees.find(e => e.id === rate.funcionarioId)?.nome}</td>
                                    <td className="p-2">{formatCurrency(rate.valor_diaria + rate.valor_alimentacao + rate.valor_deslocamento)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }


    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold text-gray-800">Lotes de Pagamento</h1>
                <button
                    onClick={openFormModal}
                    className="inline-flex items-center px-4 py-2 bg-themeBlue-600 text-white rounded-md hover:bg-themeBlue-700"
                >
                    <FaPlus className="mr-2" />
                    Novo Lote
                </button>
            </div>
            
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                {isLoading ? (
                     <div className="flex justify-center items-center p-10">
                        <svg className="animate-spin h-8 w-8 text-themeBlue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : batches.length === 0 ? (
                    <div className="text-center p-10 text-gray-500">Nenhum lote de pagamento encontrado.</div>
                ) : (
                    <table className="w-full table-auto">
                         <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionários</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {batches.map(batch => (
                                <tr key={batch.id}>
                                    <td className="px-6 py-4">{formatDate(batch.createdAt)}</td>
                                    <td className="px-6 py-4">{formatDate(batch.startDate)} - {formatDate(batch.endDate)}</td>
                                    <td className="px-6 py-4 text-sm">{getEmployeeNames(batch.employeeIds)}</td>
                                    <td className="px-6 py-4">{formatCurrency(batch.totalAmount)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${batch.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {batch.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button onClick={() => openDetailModal(batch)} className="text-gray-500 hover:text-themeBlue-700" title="Ver Detalhes"><FaEye /></button>
                                        {batch.status === 'aberto' && (
                                           <button onClick={() => handleMarkAsPaid(batch.id)} className="text-green-500 hover:text-green-700" title="Marcar como Pago"><FaCheck /></button>
                                        )}
                                        <button onClick={() => handleDeleteRequest(batch.id)} className="text-red-600 hover:text-red-900" title="Excluir Lote"><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal isOpen={isFormModalOpen} onClose={closeFormModal} title="Gerar Novo Lote de Pagamento">
                <PaymentBatchForm onSave={handleSave} onCancel={closeFormModal} />
            </Modal>
            
            <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal} title={`Detalhes do Lote #${selectedBatch?.id.substring(0, 8)}`}>
                <DetailModalContent />
            </Modal>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmDelete}
                title="Confirmar Exclusão"
            >
                Você tem certeza que deseja excluir este lote de pagamento? As diárias associadas serão desvinculadas.
            </ConfirmModal>
        </div>
    );
};

export default Pagamentos;
