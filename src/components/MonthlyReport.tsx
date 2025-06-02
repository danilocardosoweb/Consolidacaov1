
import React, { useState } from 'react';
import { ArrowLeft, Calendar, TrendingUp, Users, Download, Filter, RefreshCw, Eye, BarChart3, PieChart, LineChart, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import ReportCharts from './report/ReportCharts';
import ReportMetrics from './report/ReportMetrics';
import ReportComparison from './report/ReportComparison';
import ReportInsights from './report/ReportInsights';
import ReportMap from './report/ReportMap';

interface MonthlyReportProps {
  onNavigate: (view: string) => void;
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ onNavigate }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    // Simular geração de relatório
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-playfair font-bold text-gray-900 truncate">
                  Relatório Mensal
                </h1>
                <p className="text-sm sm:text-base text-gray-600 truncate">
                  {months[selectedMonth]} {selectedYear}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-3">
              {/* Month/Year Selector */}
              <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:space-x-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="input-church text-sm w-full py-2"
                  aria-label="Selecionar mês"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month.substring(0, 3)}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="input-church text-sm w-full py-2"
                  aria-label="Selecionar ano"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="btn-church flex items-center justify-center space-x-2 w-full sm:w-auto px-3 py-2 text-sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden p-1 sm:p-2">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <div className="w-full overflow-hidden pb-1">
            <TabsList className="w-full grid grid-cols-5 gap-0.5 sm:gap-1">
              <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm p-2 sm:px-3 sm:py-1.5">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="truncate">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm p-2 sm:px-3 sm:py-1.5">
                <LineChart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="truncate">Gráficos</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm p-2 sm:px-3 sm:py-1.5">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="truncate">Mapa</span>
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm p-2 sm:px-3 sm:py-1.5">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="truncate">Comparativo</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm p-2 sm:px-3 sm:py-1.5">
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="truncate">Insights</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden mt-1">
            <TabsContent value="overview" className="h-full overflow-hidden">
              <div className="h-full overflow-auto pr-1 pb-1">
                <ReportMetrics selectedMonth={selectedMonth} selectedYear={selectedYear} />
              </div>
            </TabsContent>

            <TabsContent value="charts" className="h-full overflow-hidden">
              <div className="h-full overflow-auto pr-1 pb-1">
                <ReportCharts selectedMonth={selectedMonth} selectedYear={selectedYear} />
              </div>
            </TabsContent>

            <TabsContent value="map" className="h-full overflow-hidden">
              <div className="h-full overflow-auto pr-1 pb-1">
                <ReportMap selectedMonth={selectedMonth} selectedYear={selectedYear} />
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="h-full overflow-hidden">
              <div className="h-full overflow-auto pr-1 pb-1">
                <ReportComparison selectedMonth={selectedMonth} selectedYear={selectedYear} />
              </div>
            </TabsContent>

            <TabsContent value="insights" className="h-full overflow-hidden">
              <div className="h-full overflow-auto pr-1 pb-1">
                <ReportInsights selectedMonth={selectedMonth} selectedYear={selectedYear} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default MonthlyReport;
