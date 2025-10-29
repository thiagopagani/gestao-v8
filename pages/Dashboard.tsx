

import React, { useEffect, useState, useMemo } from 'react';
import DashboardCard from '../components/DashboardCard';
import { companiesApi, clientsApi, employeesApi, dailyRatesApi } from '../services/api';
import { Employee, DailyRate } from '../types';
import { FaBuilding, FaUsers, FaUserTie, FaCalendarDay } from 'react-icons/fa';
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState({
        companies: 0,
        clients: 0,
        employees: 0,
        dailyRates: 0,
    });
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [dailyRates, setDailyRates] = useState<DailyRate[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            const [companiesData, clientsData, employeesData, dailyRatesData] = await Promise.all([
                companiesApi.getAll(),
                clientsApi.getAll(),
                employeesApi.getAll(),
                dailyRatesApi.getAll(),
            ]);
            setStats({
                companies: companiesData.length,
                clients: clientsData.length,
                employees: employeesData.length,
                dailyRates: dailyRatesData.length,
            });
            setEmployees(employeesData);
            setDailyRates(dailyRatesData);
        };
        fetchStats();
    }, []);

    const monthlyRevenueData = useMemo(() => {
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return { month: d.getMonth(), year: d.getFullYear() };
        }).reverse();

        const data = last6Months.map(({ month, year }) => {
            const monthName = new Date(year, month).toLocaleString('pt-BR', { month: 'short' });
            const total = dailyRates
                .filter(rate => {
                    const rateDate = new Date(rate.data + 'T00:00:00');
                    return rate.status === 'aprovado' && rateDate.getMonth() === month && rateDate.getFullYear() === year;
                })
                .reduce((sum, rate) => sum + rate.valor_diaria, 0);
            return { name: monthName.charAt(0).toUpperCase() + monthName.slice(1), faturamento: total };
        });
        return data;
    }, [dailyRates]);
    
    const employeeDistributionData = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const ratesThisMonth = dailyRates.filter(rate => {
            const rateDate = new Date(rate.data + 'T00:00:00');
            return rateDate.getMonth() === currentMonth && rateDate.getFullYear() === currentYear;
        });

        const distribution = ratesThisMonth.reduce((acc, rate) => {
            const employeeName = employees.find(e => e.id === rate.funcionarioId)?.nome || 'Desconhecido';
            acc[employeeName] = (acc[employeeName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(distribution).map(([name, value]) => ({ name, value }));
    }, [dailyRates, employees]);

    const COLORS = ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'];
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);


    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                <DashboardCard title="Total de Empresas" value={stats.companies} icon={<FaBuilding className="w-5 h-5" />} />
                <DashboardCard title="Total de Clientes" value={stats.clients} icon={<FaUsers className="w-5 h-5" />} />
                <DashboardCard title="Total de Funcionários" value={stats.employees} icon={<FaUserTie className="w-5 h-5" />} />
                <DashboardCard title="Diárias Registradas" value={stats.dailyRates} icon={<FaCalendarDay className="w-5 h-5" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <div className="bg-white p-4 shadow-md rounded-lg">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Faturamento Mensal (Últimos 6 Meses)</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend />
                            <Bar dataKey="faturamento" fill="#2563eb" name="Faturamento"/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-4 shadow-md rounded-lg">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Distribuição de Diárias por Funcionário (Mês Atual)</h2>
                     {employeeDistributionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={employeeDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    // FIX: The `percent` property can be undefined or a non-number, causing an arithmetic error.
                                    // Coerce to a number and provide a default value to handle this case.
                                    label={({ name, percent }) => `${name} ${(Number(percent ?? 0) * 100).toFixed(0)}%`}
                                >
                                    {employeeDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                           Nenhuma diária registrada este mês.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;