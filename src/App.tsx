
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Páginas
import Index from './pages/Index';
import Dashboard from './components/Dashboard';
import VisitorForm from './components/VisitorForm';
import VisitorTable from './components/VisitorTable';
import Settings from './components/Settings';
import ExportData from './components/ExportData';
import MonthlyReport from './components/MonthlyReport';
import CellManagement from './components/CellManagement';
import CafeStarter from './components/CafeStarter';

// Componente wrapper para passar a navegação como prop
const withNavigation = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const navigate = useNavigate();
    const handleNavigate = (path: string) => navigate(path);
    
    // Mapeia os caminhos antigos para os novos
    const pathMap: Record<string, string> = {
      'dashboard': '/dashboard',
      'visitors': '/visitors',
      'form': '/visitors/new',
      'cells': '/cells',
      'cafe-starter': '/cafe-starter',
      'settings': '/settings',
      'export': '/export',
      'report': '/reports',
      'monthly-report': '/reports',
      'home': '/'
    };
    
    const enhancedProps = {
      ...props,
      onNavigate: (view: string) => {
        const path = pathMap[view] || '/';
        navigate(path);
      }
    };
    
    return <Component {...enhancedProps} />;
  };
};

// Componentes com navegação
const DashboardWithNav = withNavigation(Dashboard);
const VisitorTableWithNav = withNavigation(VisitorTable);
const VisitorFormWithNav = withNavigation(VisitorForm);
const CellManagementWithNav = withNavigation(CellManagement);
const CafeStarterWithNav = withNavigation(CafeStarter);
const SettingsWithNav = withNavigation(Settings);
const ExportDataWithNav = withNavigation(ExportData);
const MonthlyReportWithNav = withNavigation(MonthlyReport);

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DashboardWithNav />} />
          <Route path="/visitors" element={<VisitorTableWithNav />} />
          <Route path="/visitors/new" element={<VisitorFormWithNav />} />
          <Route path="/cells" element={<CellManagementWithNav />} />
          <Route path="/cafe-starter" element={<CafeStarterWithNav />} />
          <Route path="/settings" element={<SettingsWithNav />} />
          <Route path="/export" element={<ExportDataWithNav />} />
          <Route path="/reports" element={<MonthlyReportWithNav />} />
          {/* Redireciona rotas desconhecidas para a página inicial */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
