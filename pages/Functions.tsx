import React, { useState, useEffect } from 'react';
import { Func } from '../types';
import { funcsApi } from '../services/api';
import Modal from '../components/Modal';
import FunctionForm from '../components/FunctionForm';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Functions: React.FC = () => {
  const [funcs, setFuncs] = useState<Func[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedFunc, setSelectedFunc] = useState<Func | null>(null);
  const [funcToDelete, setFuncToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchFuncs();
  }, []);

  const fetchFuncs = async () => {
    setIsLoading(true);
    try {
        const data = await funcsApi.getAll();
        setFuncs(data);
    } catch (error) {
        toast.error("Falha ao carregar funções.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSave = async (funcData: Omit<Func, 'id'>) => {
    try {
      if (selectedFunc) {
        await funcsApi.update(selectedFunc.id, funcData);
        toast.success('Função atualizada com sucesso!');
      } else {
        await funcsApi.create(funcData);
        toast.success('Função criada com sucesso!');
      }
      fetchFuncs();
      closeFormModal();
    } catch (error) {
      toast.error('Erro ao salvar função.');
    }
  };

  const handleDeleteRequest = (id: number) => {
    setFuncToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (funcToDelete) {
      try {
        await funcsApi.remove(funcToDelete);
        toast.success('Função excluída com sucesso!');
        fetchFuncs();
      } catch (error) {
        toast.error('Erro ao excluir função.');
      } finally {
        closeConfirmModal();
      }
    }
  };

  const openFormModal = (func: Func | null = null) => {
    setSelectedFunc(func);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setSelectedFunc(null);
    setIsFormModalOpen(false);
  };
  
  const closeConfirmModal = () => {
      setIsConfirmModalOpen(false);
      setFuncToDelete(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Funções</h1>
        <button
          onClick={() => openFormModal()}
          className="px-4 py-2 bg-themeBlue-600 text-white rounded-md hover:bg-themeBlue-700"
        >
          Adicionar Função
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
        ) : funcs.length === 0 ? (
            <div className="text-center p-10 text-gray-500">
                Nenhuma função cadastrada.
            </div>
        ) : (
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {funcs.map((func) => (
                  <tr key={func.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{func.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{func.descricao}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${func.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {func.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openFormModal(func)} className="text-themeBlue-600 hover:text-themeBlue-900 mr-4">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteRequest(func.id)} className="text-red-600 hover:text-red-900">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
      </div>

      <Modal isOpen={isFormModalOpen} onClose={closeFormModal} title={selectedFunc ? 'Editar Função' : 'Adicionar Função'}>
        <FunctionForm onSave={handleSave} onCancel={closeFormModal} func={selectedFunc} />
      </Modal>
      
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
      >
        Você tem certeza que deseja excluir esta função? Esta ação não pode ser desfeita.
      </ConfirmModal>
    </div>
  );
};

export default Functions;