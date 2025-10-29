// FIX: Implemented the Relatorios component to provide reporting functionality and resolve the module not found error. This includes data fetching, filtering, and PDF export capabilities.
import React, { useState, useEffect, useMemo } from 'react';
import { DailyRate, Employee, Client, Company } from '../types';
import { dailyRatesApi, employeesApi, clientsApi, companiesApi } from '../services/api';
import { FaFilePdf, FaFileCsv } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

interface ReportData {
  dailyRatesByClient: { name: string; count: number }[];
  paidRatesByEmployee: { name: string; count: number }[];
  employeeClientRelation: { employee: string; client: string; count: number }[];
  revenueByCompany: { name: string; total: number }[];
  expensesByEmployee: { name: string; total: number }[];
  expensesByClient: { name: string; total: number }[];
}

const ReportTable = ({ title, headers, data, onExportPDF, onExportCSV }: { title: string, headers: string[], data: any[], onExportPDF: () => void, onExportCSV: () => void }) => {
    if (data.length === 0) return null;
    return (
        <div className="bg-white p-4 shadow-md rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-700">{title}</h2>
                <div className="flex space-x-2">
                    <button onClick={onExportPDF} className="text-red-500 hover:text-red-700" title="Exportar para PDF">
                        <FaFilePdf size={20} />
                    </button>
                    <button onClick={onExportCSV} className="text-green-500 hover:text-green-700" title="Exportar para CSV">
                        <FaFileCsv size={20} />
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                        <tr>
                            {headers.map(header => (
                                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((row, index) => (
                            <tr key={index}>
                                {Object.values(row).map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-black">{cell as React.ReactNode}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const Relatorios: React.FC = () => {
    const [allRates, setAllRates] = useState<DailyRate[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
    });
    const [reportData, setReportData] = useState<ReportData | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            const [ratesData, employeesData, clientsData, companiesData] = await Promise.all([
                dailyRatesApi.getAll(),
                employeesApi.getAll(),
                clientsApi.getAll(),
                companiesApi.getAll(),
            ]);
            setAllRates(ratesData);
            setEmployees(employeesData);
            setClients(clientsData);
            setCompanies(companiesData);
        };
        fetchData();
    }, []);

    const getEmployeeName = (id: number) => employees.find(e => e.id === id)?.nome || 'N/A';
    const getClientName = (id: number) => clients.find(c => c.id === id)?.nome || 'N/A';
    const getCompanyName = (clientId: number) => {
        const client = clients.find(c => c.id === clientId);
        return client ? companies.find(c => c.id === client.empresaId)?.nome : 'N/A';
    }
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const handleGenerateReport = () => {
        const filteredRates = allRates.filter(rate => {
            const rateDate = new Date(rate.data + 'T00:00:00');
            const startDate = filters.startDate ? new Date(filters.startDate + 'T00:00:00') : null;
            const endDate = filters.endDate ? new Date(filters.endDate + 'T00:00:00') : null;

            if (startDate && rateDate < startDate) return false;
            if (endDate && rateDate > endDate) return false;
            return true;
        });

        // FIX: Explicitly typed accumulator in reduce to prevent type inference issues.
        const dailyRatesByClient = filteredRates.reduce((acc: Record<string, number>, rate) => {
            const clientName = getClientName(rate.clienteId);
            acc[clientName] = (acc[clientName] || 0) + 1;
            return acc;
        }, {});

        const paidRates = filteredRates.filter(r => r.status === 'aprovado');

        // FIX: Explicitly typed accumulator in reduce to prevent type inference issues.
        const paidRatesByEmployee = paidRates.reduce((acc: Record<string, number>, rate) => {
            const employeeName = getEmployeeName(rate.funcionarioId);
            acc[employeeName] = (acc[employeeName] || 0) + 1;
            return acc;
        }, {});
        
        // FIX: Explicitly typed accumulator in reduce to prevent type inference issues.
        const employeeClientRelation = paidRates.reduce((acc: Record<string, number>, rate) => {
            const key = `${getEmployeeName(rate.funcionarioId)}|${getClientName(rate.clienteId)}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        // FIX: Explicitly typed accumulator in reduce to prevent type inference issues.
        const revenueByCompany = paidRates.reduce((acc: Record<string, number>, rate) => {
            const companyName = getCompanyName(rate.clienteId);
            if(companyName !== 'N/A') {
                acc[companyName] = (acc[companyName] || 0) + rate.valor_diaria;
            }
            return acc;
        }, {});

        // FIX: Explicitly typed accumulator in reduce to prevent type inference issues.
        const expensesByEmployee = filteredRates.reduce((acc: Record<string, number>, rate) => {
            const employeeName = getEmployeeName(rate.funcionarioId);
            const expenses = rate.valor_deslocamento + rate.valor_alimentacao;
            acc[employeeName] = (acc[employeeName] || 0) + expenses;
            return acc;
        }, {});

        // FIX: Explicitly typed accumulator in reduce to prevent type inference issues.
        const expensesByClient = filteredRates.reduce((acc: Record<string, number>, rate) => {
            const clientName = getClientName(rate.clienteId);
            const expenses = rate.valor_deslocamento + rate.valor_alimentacao;
            acc[clientName] = (acc[clientName] || 0) + expenses;
            return acc;
        }, {});

        // FIX: Removed currency formatting from state update to match the `ReportData` type which expects `total` to be a number.
        // Formatting is now applied at the presentation layer (in the ReportTable component props).
        setReportData({
            dailyRatesByClient: Object.entries(dailyRatesByClient).map(([name, count]) => ({ name, count })),
            paidRatesByEmployee: Object.entries(paidRatesByEmployee).map(([name, count]) => ({ name, count })),
            employeeClientRelation: Object.entries(employeeClientRelation).map(([key, count]) => ({
                employee: key.split('|')[0],
                client: key.split('|')[1],
                count
            })),
            revenueByCompany: Object.entries(revenueByCompany).map(([name, total]) => ({ name, total })),
            expensesByEmployee: Object.entries(expensesByEmployee).map(([name, total]) => ({ name, total })),
            expensesByClient: Object.entries(expensesByClient).map(([name, total]) => ({ name, total })),
        });
    };
    
    const exportToPDF = (title: string, headers: string[], data: any[]) => {
        const doc = new jsPDF();
        doc.text(title, 14, 16);
        autoTable(doc, {
            head: [headers],
            body: data.map(row => Object.values(row)),
            startY: 20,
        });
        doc.save(`${title.toLowerCase().replace(/ /g, '_')}.pdf`);
    };

    const exportToCSV = (headers: string[], data: any[], filename: string) => {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Relatórios</h1>

            <div className="bg-white p-4 shadow-md rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-2 border rounded w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-2 border rounded w-full" />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleGenerateReport}
                            className="w-full px-4 py-2 bg-themeBlue-600 text-white rounded-md hover:bg-themeBlue-700"
                        >
                            Gerar Relatório
                        </button>
                    </div>
                </div>
            </div>

            {reportData && (
                <>
                   <ReportTable 
                        title="Diárias por Cliente"
                        headers={['Cliente', 'Quantidade']}
                        data={reportData.dailyRatesByClient}
                        onExportPDF={() => exportToPDF('Diárias por Cliente', ['Cliente', 'Quantidade'], reportData.dailyRatesByClient)}
                        onExportCSV={() => exportToCSV(['Cliente', 'Quantidade'], reportData.dailyRatesByClient, 'diarias_por_cliente')}
                    />
                    <ReportTable 
                        title="Diárias Pagas por Funcionário"
                        headers={['Funcionário', 'Quantidade']}
                        data={reportData.paidRatesByEmployee}
                        onExportPDF={() => exportToPDF('Diárias Pagas por Funcionário', ['Funcionário', 'Quantidade'], reportData.paidRatesByEmployee)}
                        onExportCSV={() => exportToCSV(['Funcionário', 'Quantidade'], reportData.paidRatesByEmployee, 'diarias_pagas_por_funcionario')}
                    />
                     <ReportTable 
                        title="Relação Funcionário-Cliente"
                        headers={['Funcionário', 'Cliente', 'Quantidade']}
                        data={reportData.employeeClientRelation}
                        onExportPDF={() => exportToPDF('Relação Funcionário-Cliente', ['Funcionário', 'Cliente', 'Quantidade'], reportData.employeeClientRelation)}
                        onExportCSV={() => exportToCSV(['Funcionário', 'Cliente', 'Quantidade'], reportData.employeeClientRelation, 'relacao_funcionario_cliente')}
                    />
                    {/* FIX: Apply currency formatting to the `total` field for display in the table and for PDF export. */}
                    <ReportTable 
                        title="Faturamento por Empresa (Diárias Aprovadas)"
                        headers={['Empresa', 'Valor Total']}
                        data={reportData.revenueByCompany.map(item => ({ ...item, total: formatCurrency(item.total) }))}
                        onExportPDF={() => exportToPDF('Faturamento por Empresa', ['Empresa', 'Valor Total'], reportData.revenueByCompany.map(item => ({...item, total: formatCurrency(item.total)})))}
                        onExportCSV={() => exportToCSV(['Empresa', 'Valor Total'], reportData.revenueByCompany, 'faturamento_por_empresa')}
                    />
                    <ReportTable 
                        title="Despesas Extras por Funcionário"
                        headers={['Funcionário', 'Valor Total']}
                        data={reportData.expensesByEmployee.map(item => ({ ...item, total: formatCurrency(item.total) }))}
                        onExportPDF={() => exportToPDF('Despesas Extras por Funcionário', ['Funcionário', 'Valor Total'], reportData.expensesByEmployee.map(item => ({...item, total: formatCurrency(item.total)})))}
                        onExportCSV={() => exportToCSV(['Funcionário', 'Valor Total'], reportData.expensesByEmployee, 'despesas_por_funcionario')}
                    />
                    <ReportTable 
                        title="Despesas Extras por Cliente"
                        headers={['Cliente', 'Valor Total']}
                        data={reportData.expensesByClient.map(item => ({ ...item, total: formatCurrency(item.total) }))}
                        onExportPDF={() => exportToPDF('Despesas Extras por Cliente', ['Cliente', 'Valor Total'], reportData.expensesByClient.map(item => ({...item, total: formatCurrency(item.total)})))}
                        onExportCSV={() => exportToCSV(['Cliente', 'Valor Total'], reportData.expensesByClient, 'despesas_por_cliente')}
                    />
                </>
            )}
        </div>
    );
};

export default Relatorios;
