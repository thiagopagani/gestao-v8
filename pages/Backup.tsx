import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  companiesApi,
  clientsApi,
  employeesApi,
  funcsApi,
  dailyRatesApi,
  usersApi,
  paymentBatchesApi
} from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { FaDownload, FaUpload } from 'react-icons/fa';
import axios from 'axios';

const Backup: React.FC = () => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [backupFileContent, setBackupFileContent] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    try {
      toast.info('Iniciando o backup... Por favor, aguarde.');

      const [
        companies,
        clients,
        employees,
        funcs,
        dailyRates,
        users,
        paymentBatches
      ] = await Promise.all([
        companiesApi.getAll(),
        clientsApi.getAll(),
        employeesApi.getAll(),
        funcsApi.getAll(),
        dailyRatesApi.getAll(),
        usersApi.getAll(),
        paymentBatchesApi.getAll()
      ]);

      const backupData = {
        companies,
        clients,
        employees,
        funcs,
        dailyRates,
        users,
        paymentBatches,
        backupDate: new Date().toISOString()
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `gestao_v8_backup_${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Backup realizado com sucesso!');

    } catch (error) {
      console.error("Erro ao criar backup:", error);
      toast.error('Ocorreu um erro ao gerar o backup.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const parsedContent = JSON.parse(content);
             // Basic validation
            if (parsedContent && parsedContent.companies && parsedContent.clients && parsedContent.employees) {
                setBackupFileContent(parsedContent);
                setIsConfirmModalOpen(true);
            } else {
                 throw new Error("Formato de arquivo de backup inválido.");
            }
        } catch(err) {
            toast.error('O arquivo de backup é inválido ou está corrompido.');
            setBackupFileContent(null);
        }
      };
      reader.onerror = () => {
        toast.error('Erro ao ler o arquivo.');
      };
      reader.readAsText(file);
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const confirmRestore = async () => {
    if (!backupFileContent) return;

    try {
        await axios.post('/api/backup/restore', backupFileContent, { withCredentials: true });
        toast.success('Restauração enviada com sucesso! O servidor está processando. A aplicação será recarregada.');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
    } catch (error) {
      console.error("Erro ao restaurar backup:", error);
      toast.error('Ocorreu um erro ao enviar o backup para o servidor.');
    } finally {
        setIsConfirmModalOpen(false);
        setBackupFileContent(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Backup e Restauração</h1>
      
      <div className="bg-white p-6 shadow-md rounded-lg mb-8">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Exportar Dados</h2>
        <p className="text-gray-600 mb-4">
          Clique no botão abaixo para baixar um arquivo de backup completo com todos os dados do sistema. Guarde este arquivo em um local seguro.
        </p>
        <button
          onClick={handleBackup}
          className="inline-flex items-center px-4 py-2 bg-themeBlue-600 text-white rounded-md hover:bg-themeBlue-700"
        >
          <FaDownload className="mr-2" />
          Baixar Backup Completo
        </button>
      </div>

      <div className="bg-white p-6 shadow-md rounded-lg border-l-4 border-red-500">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Importar Dados</h2>
        <p className="text-gray-600 mb-4">
          Para restaurar os dados de um arquivo de backup, clique no botão abaixo. <strong className="text-red-700">Atenção:</strong> esta ação substituirá permanentemente todos os dados atuais no servidor.
        </p>
        <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
        />
        <button
          onClick={handleUploadClick}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          <FaUpload className="mr-2" />
          Carregar Arquivo de Backup
        </button>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmRestore}
        title="Confirmar Restauração"
      >
        Você tem certeza que deseja restaurar os dados deste backup? <strong className="text-red-700">Todos os dados atuais no servidor serão substituídos permanentemente.</strong> Esta ação não pode ser desfeita.
      </ConfirmModal>
    </div>
  );
};

export default Backup;