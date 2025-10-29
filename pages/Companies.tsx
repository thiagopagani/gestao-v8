import React, { useState, useEffect, useMemo } from 'react';
import { Company } from '../types';
import { companiesApi } from '../services/api';
import Modal from '../components/Modal';
import CompanyForm from '../components/CompanyForm';
import ConfirmModal from '../components/ConfirmModal'; 
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For loading state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
        const data = await companiesApi.getAll();
        setCompanies(data);
    } catch (error) {
        toast.error("Falha ao carregar empresas.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSave = async (companyData: Omit<Company, 'id'>) => {
    try {
      if (selectedCompany) {
        await companiesApi.update(selectedCompany.id, companyData);
        toast.success('Empresa atualizada com sucesso!');
      } else {
        await companiesApi.create(companyData);
        toast.success('Empresa criada com sucesso!');
      }
      fetchCompanies();
      closeFormModal();
    } catch (error) {
      toast.error('Erro ao salvar empresa.');
    }
  };

  const handleDeleteRequest = (id: number) => {
    setCompanyToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (companyToDelete) {
      try {
        await companiesApi.remove(companyToDelete);
        toast.success('Empresa excluída com sucesso!');
        fetchCompanies();
      } catch (error) {
        toast.error('Erro ao excluir empresa.');
      } finally {
        setIsConfirmModalOpen(false);
        setCompanyToDelete(null);
      }
    }
  };

  const openFormModal = (company: Company | null = null) => {
    setSelectedCompany(company);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setSelectedCompany(null);
    setIsFormModalOpen(false);
  };
  
  const closeConfirmModal = () => {
      setIsConfirmModalOpen(false);
      setCompanyToDelete(null);
  };

  const filteredCompanies = useMemo(() => {
    if (!searchQuery) {
      return companies;
    }
    return companies.filter(company =>
      company.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.cpf_cnpj.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [companies, searchQuery]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Empresas</h1>
        <button
          onClick={() => openFormModal()}
          className="px-4 py-2 bg-themeBlue-600 text-white rounded-md hover:bg-themeBlue-700"
        >
          Adicionar Empresa
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <FaSearch className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, CNPJ ou email..."
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
        ) : filteredCompanies.length === 0 ? (
            <div className="text-center p-10 text-gray-500">
                {searchQuery ? 'Nenhuma empresa encontrada para sua busca.' : 'Nenhuma empresa cadastrada.'}
            </div>
        ) : (
            <table className="w-full table-auto">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCompanies.map((company) => (
                    <tr key={company.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{company.nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{company.cpf_cnpj}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{company.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${company.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {company.status}
                        </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => openFormModal(company)} className="text-themeBlue-600 hover:text-themeBlue-900 mr-4">
                            <FaEdit />
                        </button>
                        <button onClick={() => handleDeleteRequest(company.id)} className="text-red-600 hover:text-red-900">
                            <FaTrash />
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>

      <Modal isOpen={isFormModalOpen} onClose={closeFormModal} title={selectedCompany ? 'Editar Empresa' : 'Adicionar Empresa'}>
        <CompanyForm onSave={handleSave} onCancel={closeFormModal} company={selectedCompany} />
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
      >
        Você tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.
      </ConfirmModal>
    </div>
  );
};

export default Companies;