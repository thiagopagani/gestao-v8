
import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaBuilding, FaUsers, FaUserTie, FaClipboardList, FaFileInvoiceDollar, FaUserCog, FaReceipt, FaChartBar, FaHistory, FaMoneyCheckAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
    const location = useLocation();
    const { pathname } = location;
    const trigger = useRef<HTMLButtonElement>(null);
    const sidebar = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
            if (!sidebar.current || !trigger.current) return;
            if (!sidebarOpen || sidebar.current.contains(target as Node) || trigger.current.contains(target as Node)) return;
            setSidebarOpen(false);
        };
        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
    });

    const menuItems = [
        { path: '/', icon: <FaTachometerAlt />, label: 'Dashboard', roles: ['admin', 'operador'] },
        { path: '/empresas', icon: <FaBuilding />, label: 'Empresas', roles: ['admin'] },
        { path: '/clientes', icon: <FaUsers />, label: 'Clientes', roles: ['admin'] },
        { path: '/funcionarios', icon: <FaUserTie />, label: 'Funcionários', roles: ['admin'] },
        { path: '/funcoes', icon: <FaClipboardList />, label: 'Funções', roles: ['admin'] },
        { path: '/diarias', icon: <FaFileInvoiceDollar />, label: 'Diárias', roles: ['admin', 'operador'] },
        { path: '/recibos', icon: <FaReceipt />, label: 'Recibos', roles: ['admin', 'operador'] },
        { path: '/pagamentos', icon: <FaMoneyCheckAlt />, label: 'Pagamentos', roles: ['admin'] },
        { path: '/relatorios', icon: <FaChartBar />, label: 'Relatórios', roles: ['admin'] },
        { path: '/usuarios', icon: <FaUserCog />, label: 'Usuários', roles: ['admin'] },
        { path: '/backup', icon: <FaHistory />, label: 'Backup', roles: ['admin'] },
    ];

    return (
        <div>
            <div className={`fixed inset-0 bg-gray-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} aria-hidden="true"></div>
            <div ref={sidebar} className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 transform h-screen overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 shrink-0 bg-themeBlue-800 p-4 transition-all duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'}`}>
                <div className="flex justify-between mb-10 pr-3 sm:px-2">
                    <NavLink to="/" className="flex items-center">
                        <h1 className="text-2xl font-bold text-white ml-2">Gestão</h1>
                    </NavLink>
                </div>
                <div className="space-y-2">
                    {menuItems.filter(item => user && item.roles.includes(user.role)).map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) => `flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-themeBlue-600 text-white' : 'text-gray-300 hover:bg-themeBlue-700 hover:text-white'}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            {item.icon}
                            <span className="ml-4">{item.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
