import React, { useState, useEffect, useMemo } from 'react';
import { Employee, Func } from '../types';
import { employeesApi, funcsApi } from '../services/api';
import Modal from '../components/Modal';
import EmployeeForm from '../components/EmployeeForm';
import ConfirmModal from '../components/ConfirmModal';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [funcs, setFuncs] = useState<Func[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [employeesData, funcsData] = await Promise.all([
            employeesApi.getAll(),
            funcsApi.getAll()
        ]);
        setEmployees(employeesData);
        setFuncs(funcsData);
    } catch (error) {
        toast.error("Falha ao carregar dados.");
    } finally {
        setIsLoading(false);
    }
  };

  const getFuncName = (funcaoId: number) => {
    return funcs.find(f => f.id === funcaoId)?.nome || 'N/A';
  };

  const handleSave = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      if (selectedEmployee) {
        await employeesApi.update(selectedEmployee.id, employeeData);
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        await employeesApi.create(employeeData);
        toast.success('Funcionário criado com sucesso!');
      }
      fetchData();
      closeFormModal();
    } catch (error) {
      toast.error('Erro ao salvar funcionário.');
    }
  };

  const handleDeleteRequest = (id: number) => {
    setEmployeeToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (employeeToDelete) {
      try {
        await employeesApi.remove(employeeToDelete);
        toast.success('Funcionário excluído com sucesso!');
        fetchData();
      } catch (error) {
        toast.error('Erro ao excluir funcionário.');
      } finally {
        closeConfirmModal();
      }
    }
  };

  const openFormModal = (employee: Employee | null = null) => {
    setSelectedEmployee(employee);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setSelectedEmployee(null);
    setIsFormModalOpen(false);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setEmployeeToDelete(null);
  };

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) {
      return employees;
    }
    return employees.filter(employee =>
      employee.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.cpf.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Funcionários</h1>
        <button
          onClick={() => openFormModal()}
          className="px-4 py-2 bg-themeBlue-600 text-white rounded-md hover:bg-themeBlue-700"
        >
          Adicionar Funcionário
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <FaSearch className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou email..."
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
        ) : filteredEmployees.length === 0 ? (
            <div className="text-center p-10 text-gray-500">
                {searchQuery ? 'Nenhum funcionário encontrado para sua busca.' : 'Nenhum funcionário cadastrado.'}
            </div>
        ) : (
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.cpf}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{employee.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{getFuncName(employee.funcaoId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openFormModal(employee)} className="text-themeBlue-600 hover:text-themeBlue-900 mr-4">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteRequest(employee.id)} className="text-red-600 hover:text-red-900">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
      </div>

      <Modal isOpen={isFormModalOpen} onClose={closeFormModal} title={selectedEmployee ? 'Editar Funcionário' : 'Adicionar Funcionário'}>
        <EmployeeForm onSave={handleSave} onCancel={closeFormModal} employee={selectedEmployee} />
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
      >
        Você tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.
      </ConfirmModal>
    </div>
  );
};

export default Employees;