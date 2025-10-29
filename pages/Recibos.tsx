
import React, { useState, useEffect, useMemo } from 'react';
import { DailyRate, Employee, Client } from '../types';
import { dailyRatesApi, employeesApi, clientsApi } from '../services/api';
import { FaFilePdf, FaSearch } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

const Recibos: React.FC = () => {
  const [approvedRates, setApprovedRates] = useState<DailyRate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
      setApprovedRates(ratesData.filter(rate => rate.status === 'aprovado'));
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
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDate = (dateString: string) => new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');

  const generatePdf = (rate: DailyRate) => {
    const doc = new jsPDF();
    const employee = employees.find(e => e.id === rate.funcionarioId);
    const client = clients.find(c => c.id === rate.clienteId);

    doc.setFontSize(20);
    doc.text('Recibo de Diária', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Recibo #${rate.id}`, 14, 30);
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 37);

    autoTable(doc, {
        startY: 45,
        head: [['Descrição', 'Detalhes']],
        body: [
            ['Data da Diária', formatDate(rate.data)],
            ['Funcionário', employee?.nome || 'N/A'],
            ['CPF Funcionário', employee?.cpf || 'N/A'],
            ['Cliente', client?.nome || 'N/A'],
            ['CNPJ Cliente', client?.cpf_cnpj || 'N/A'],
        ],
        theme: 'striped',
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 100;

    autoTable(doc, {
        startY: finalY + 10,
        head: [['Item', 'Valor']],
        body: [
            ['Valor da Diária', formatCurrency(rate.valor_diaria)],
            ['Valor do Deslocamento', formatCurrency(rate.valor_deslocamento)],
            ['Valor da Alimentação', formatCurrency(rate.valor_alimentacao)],
        ],
        foot: [['TOTAL', formatCurrency(rate.valor_diaria + rate.valor_deslocamento + rate.valor_alimentacao)]],
        theme: 'grid',
        footStyles: { fontStyle: 'bold' }
    });

    if (rate.observacao) {
        doc.text('Observações:', 14, (doc as any).lastAutoTable.finalY + 10);
        doc.text(rate.observacao, 14, (doc as any).lastAutoTable.finalY + 17);
    }


    doc.save(`recibo_diaria_${rate.id}.pdf`);
  };
  
  const filteredRates = useMemo(() => {
    if (!searchQuery) {
      return approvedRates;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return approvedRates.filter(rate =>
      getEmployeeName(rate.funcionarioId).toLowerCase().includes(lowercasedQuery) ||
      getClientName(rate.clienteId).toLowerCase().includes(lowercasedQuery)
    );
  }, [approvedRates, searchQuery, employees, clients]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Gerar Recibos</h1>

      <div className="mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <FaSearch className="text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Buscar por funcionário ou cliente..."
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
        ) : filteredRates.length === 0 ? (
          <div className="text-center p-10 text-gray-500">
            Nenhuma diária aprovada encontrada.
          </div>
        ) : (
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Funcionário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRates.map((rate) => (
                <tr key={rate.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{formatDate(rate.data)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{getEmployeeName(rate.funcionarioId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{getClientName(rate.clienteId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">{formatCurrency(rate.valor_diaria + rate.valor_alimentacao + rate.valor_deslocamento)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => generatePdf(rate)}
                      className="text-red-600 hover:text-red-900"
                      title="Gerar PDF"
                    >
                      <FaFilePdf size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Recibos;
