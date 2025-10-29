
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Clients from './pages/Clients';
import Employees from './pages/Employees';
import Functions from './pages/Functions';
import DailyRates from './pages/DailyRates';
import Users from './pages/Users';
import Recibos from './pages/Recibos';
import Relatorios from './pages/Relatorios';
import Backup from './pages/Backup';
import Pagamentos from './pages/Pagamentos';

const PrivateRoute: React.FC<{ children: React.ReactElement, roles?: string[] }> = ({ children, roles }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />; // Or a specific "unauthorized" page
    }

    return children;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/*"
                element={
                    <PrivateRoute>
                        <Layout>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/empresas" element={<PrivateRoute roles={['admin']}><Companies /></PrivateRoute>} />
                                <Route path="/clientes" element={<PrivateRoute roles={['admin']}><Clients /></PrivateRoute>} />
                                <Route path="/funcionarios" element={<PrivateRoute roles={['admin']}><Employees /></PrivateRoute>} />
                                <Route path="/funcoes" element={<PrivateRoute roles={['admin']}><Functions /></PrivateRoute>} />
                                <Route path="/diarias" element={<DailyRates />} />
                                <Route path="/recibos" element={<Recibos />} />
                                <Route path="/pagamentos" element={<PrivateRoute roles={['admin']}><Pagamentos /></PrivateRoute>} />
                                <Route path="/relatorios" element={<PrivateRoute roles={['admin']}><Relatorios /></PrivateRoute>} />
                                <Route path="/usuarios" element={<PrivateRoute roles={['admin']}><Users /></PrivateRoute>} />
                                <Route path="/backup" element={<PrivateRoute roles={['admin']}><Backup /></PrivateRoute>} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </Layout>
                    </PrivateRoute>
                }
            />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
        <Router>
            <AppRoutes />
        </Router>
        <ToastContainer autoClose={3000} hideProgressBar />
    </AuthProvider>
  );
};

export default App;