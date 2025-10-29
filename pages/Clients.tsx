
import React, { useState, useEffect, useMemo } from 'react';
import { Client, Company } from '../types';
import { clientsApi, companiesApi } from '../services/api';
import Modal from '../components/Modal';
import ClientForm from '../components/ClientForm';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [clientsData, companiesData] = await Promise.all([
        clientsApi.getAll(),
        companiesApi.getAll(),
      ]);
      setClients(clientsData);
      setCompanies(companiesData);
    } catch (error) {
      toast.error("Falha ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  };

  const getCompanyName = (empresaId: number) => {
    return companies.find(c => c.id === empresaId)?.nome || 'N/A';
  };

  const handleSave = async (clientData: Omit<Client, 'id'>) => {
    try {
      if (selectedClient) {
        await clientsApi.update(selectedClient.id, clientData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await clientsApi.create(clientData);
        toast.success('Cliente criado com sucesso!');
      }
      fetchData();
      closeFormModal();
    } catch (error) {
      toast.error('Erro ao salvar cliente.');
    }
  };

  const handleDeleteRequest = (id: number) => {
    setClientToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      try {
        await clientsApi.remove(clientToDelete);
        toast.success('Cliente excluído com sucesso!');
        fetchData();
      } catch (error) {
        toast.error('Erro ao excluir cliente.');
      } finally {
        setIsConfirmModalOpen(false);
        setClientToDelete(null);
      }
    }
  };

  const openFormModal = (client: Client | null = null) => {
    setSelectedClient(client);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setSelectedClient(null);
    setIsFormModalOpen(false);
  };
  
  const closeConfirmModal = () => {
      setIsConfirmModalOpen(false);
      setClientToDelete(null);
  };

  const filteredClients = useMemo(() => {
    if (!searchQuery) {
      return clients;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return clients.filter(client =>
      client.nome.toLowerCase().includes(lowercasedQuery) ||
      client.cpf_cnpj.toLowerCase().includes(lowercasedQuery) ||
      client.email.toLowerCase().includes(lowercasedQuery)
    );
  }, [clients, searchQuery]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Clientes</h1>
        <button
          onClick={() => openFormModal()}
          className="px-4 py-2 bg-themeBlue-600 text-white rounded-md hover:bg-themeBlue-700"
        >
          Adicionar Cliente
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <FaSearch className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, CPF/CNPJ ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {isLoading ? (
            <div className="flex justify-center items-center p-10">
                <svg className="animate-spin h-8 w-8 text-themeBlue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        ) : filteredClients.length === 0 ? (
            <div className="text-center p-10 text-gray-500">
                {searchQuery ? 'Nenhum cliente encontrado para sua busca.' : 'Nenhum cliente cadastrado.'}
            </div>
        ) : (
            <table className="w-full table-auto">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF/CNPJ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                    <tr key={client.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{client.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{client.cpf_cnpj}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{client.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{getCompanyName(client.empresaId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${client.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {client.status}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openFormModal(client)} className="text-themeBlue-600 hover:text-themeBlue-900 mr-4">
                            <FaEdit />
                        </button>
                        <button onClick={() => handleDeleteRequest(client.id)} className="text-red-600 hover:text-red-900">
                            <FaTrash />
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>

      <Modal isOpen={isFormModalOpen} onClose={closeFormModal} title={selectedClient ? 'Editar Cliente' : 'Adicionar Cliente'}>
        <ClientForm onSave={handleSave} onCancel={closeFormModal} client={selectedClient} />
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
      >
        Você tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
      </ConfirmModal>
    </div>
  );
};

export default Clients;
