
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import VisitorForm from './components/VisitorForm';
import VisitorTable from './components/VisitorTable';
import Settings from './components/Settings';
import ExportData from './components/ExportData';
import MonthlyReport from './components/MonthlyReport';
import CellManagement from './components/CellManagement';
import CafeStarter from './components/CafeStarter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const queryClient = new QueryClient();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'form':
        return <VisitorForm onNavigate={setCurrentView} />;
      case 'visitors':
        return <VisitorTable onNavigate={setCurrentView} />;
      case 'cells':
        return <CellManagement onNavigate={setCurrentView} />;
      case 'cafe-starter':
        return <CafeStarter onNavigate={setCurrentView} />;
      case 'settings':
        return <Settings onNavigate={setCurrentView} />;
      case 'export':
        return <ExportData onNavigate={setCurrentView} />;
      case 'report':
        return <MonthlyReport onNavigate={setCurrentView} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        {renderCurrentView()}
      </div>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
