import React, { useState, useEffect, useMemo } from 'react';
import { User } from '../types';
import { usersApi } from '../services/api';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
        const data = await usersApi.getAll();
        setUsers(data);
    } catch (error) {
        toast.error("Falha ao carregar usuários.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSave = async (userData: Omit<User, 'id'>) => {
    try {
      if (selectedUser) {
        await usersApi.update(selectedUser.id, userData);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await usersApi.create(userData);
        toast.success('Usuário criado com sucesso!');
      }
      fetchUsers();
      closeFormModal();
    } catch (error) {
      toast.error('Erro ao salvar usuário.');
    }
  };

  const handleDeleteRequest = (id: number) => {
    setUserToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await usersApi.remove(userToDelete);
        toast.success('Usuário excluído com sucesso!');
        fetchUsers();
      } catch (error) {
        toast.error('Erro ao excluir usuário.');
      } finally {
        closeConfirmModal();
      }
    }
  };

  const openFormModal = (user: User | null = null) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setSelectedUser(null);
    setIsFormModalOpen(false);
  };
  
  const closeConfirmModal = () => {
      setIsConfirmModalOpen(false);
      setUserToDelete(null);
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) {
      return users;
    }
    return users.filter(user =>
      user.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Usuários</h1>
        <button
          onClick={() => openFormModal()}
          className="px-4 py-2 bg-themeBlue-600 text-white rounded-md hover:bg-themeBlue-700"
        >
          Adicionar Usuário
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <FaSearch className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
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
        ) : filteredUsers.length === 0 ? (
            <div className="text-center p-10 text-gray-500">
                {searchQuery ? 'Nenhum usuário encontrado para sua busca.' : 'Nenhum usuário cadastrado.'}
            </div>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => openFormModal(user)} className="text-themeBlue-600 hover:text-themeBlue-900 mr-4">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDeleteRequest(user.id)} className="text-red-600 hover:text-red-900">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isFormModalOpen} onClose={closeFormModal} title={selectedUser ? 'Editar Usuário' : 'Adicionar Usuário'}>
        <UserForm onSave={handleSave} onCancel={closeFormModal} user={selectedUser} />
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
      >
        Você tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.
      </ConfirmModal>
    </div>
  );
};

export default Users;