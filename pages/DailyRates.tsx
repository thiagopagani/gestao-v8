import React, { useState, useEffect, useMemo } from 'react';
import { DailyRate, Employee, Client } from '../types';
import { dailyRatesApi, employeesApi, clientsApi } from '../services/api';
import Modal from '../components/Modal';
import DailyRateForm from '../components/DailyRateForm';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const DailyRates: React.FC = () => {
  const [dailyRates, setDailyRates] = useState<DailyRate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<DailyRate | null>(null);
  const [rateToDelete, setRateToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [ratesData, employeesData, clientsData] = await Promise.all([
          dailyRatesApi.getAll(),
          employeesApi.getAll(),
          clientsApi.getAll(),
        ]);
        setDailyRates(ratesData);
        setEmployees(employeesData);
        setClients(clientsData);
    } catch (error) {
        toast.error("Falha ao carregar dados.");
    } finally {
        setIsLoading(false);
    }
  };

  const getEmployeeName = (id: number) => employees.find(e => e.id === id)?.nome || 'N/A';
  const getClientName = (id: number) => clients.find(c => c.id === id)?.nome || 'N/A';
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  }

  const handleSave = async (rateData: Omit<DailyRate, 'id'>) => {
    try {
      if (selectedRate) {
        await dailyRatesApi.update(selectedRate.id, rateData);
        toast.success('Diária atualizada com sucesso!');
      } else {
        await dailyRatesApi.create(rateData);
        toast.success('Diária criada com sucesso!');
      }
      fetchData();
      closeFormModal();
    } catch (error) {
      toast.error('Erro ao salvar diária.');
    }
  };

  const handleDeleteRequest = (id: number) => {
    setRateToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (rateToDelete) {
      try {
        await dailyRatesApi.remove(rateToDelete);
        toast.success('Diária excluída com sucesso!');
        fetchData();
      } catch (error) {
        toast.error('Erro ao excluir diária.');
      } finally {
        closeConfirmModal();
      }
    }
  };

  const openFormModal = (rate: DailyRate | null = null) => {
    setSelectedRate(rate);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setSelectedRate(null);
    setIsFormModalOpen(false);
  };
  
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setRateToDelete(null);
  };

  const filteredRates = useMemo(() => {
    if (!searchQuery) {
      return dailyRates;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return dailyRates.filter(rate =>
      getEmployeeName(rate.funcionarioId).toLowerCase().includes(lowercasedQuery) ||
      getClientName(rate.clienteId).toLowerCase().includes(lowercasedQuery)
    );
  }, [dailyRates, searchQuery, employees, clients]);

  const paginatedRates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRates, currentPage]);

  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Diárias</h1>
        <button
          onClick={() => openFormModal()}
          className="px-4 py-2 bg-themeBlue-600 text-white rounded-md hover:bg-themeBlue-700"
        >
          Adicionar Diária
        </button>
      </div>

       {isLoading ? (
            <div className="flex justify-center items-center p-10">
                <svg className="animate-spin h-8 w-8 text-themeBlue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaSearch className="text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar por funcionário ou cliente..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>
      
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
              {paginatedRates.length === 0 ? (
                <div className="text-center p-10 text-gray-500">
                    {searchQuery ? 'Nenhuma diária encontrada para sua busca.' : 'Nenhuma diária cadastrada.'}
                </div>
              ) : (
                <table className="w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionário</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Diária</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedRates.map((rate) => (
                      <tr key={rate.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{formatDate(rate.data)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{getEmployeeName(rate.funcionarioId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{getClientName(rate.clienteId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{formatCurrency(rate.valor_diaria)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${rate.status === 'aprovado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {rate.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => openFormModal(rate)} className="text-themeBlue-600 hover:text-themeBlue-900 mr-4">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDeleteRequest(rate.id)} className="text-red-600 hover:text-red-900">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
               {totalPages > 1 && (
                <div className="px-6 py-3 bg-white border-t flex justify-between items-center">
                  <span className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm text-gray-600 bg-white border rounded disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm text-gray-600 bg-white border rounded disabled:opacity-50"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      <Modal isOpen={isFormModalOpen} onClose={closeFormModal} title={selectedRate ? 'Editar Diária' : 'Adicionar Diária'}>
        <DailyRateForm onSave={handleSave} onCancel={closeFormModal} rate={selectedRate} />
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
      >
        Você tem certeza que deseja excluir esta diária? Esta ação não pode ser desfeita.
      </ConfirmModal>
    </div>
  );
};

export default DailyRates;