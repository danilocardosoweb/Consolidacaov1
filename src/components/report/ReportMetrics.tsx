import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Calendar, TrendingUp, UserCheck, Clock, Heart, Target, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'; // Assuming Tabs components might be used here based on MonthlyReport.tsx
import { fetchMonthlyMetrics, MonthlyMetrics } from '@/lib/reportData'; // Import the fetch function and type

interface ReportMetricsProps {
  selectedMonth: number;
  selectedYear: number;
}

const ReportMetrics: React.FC<ReportMetricsProps> = ({ selectedMonth, selectedYear }) => {
  const [metrics, setMetrics] = useState<MonthlyMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      const data = await fetchMonthlyMetrics(selectedMonth, selectedYear);
      setMetrics(data);
      setLoading(false);
    };

    loadMetrics();
  }, [selectedMonth, selectedYear]); // Rerun effect when month or year changes

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Helper to format percentage change with sign and color
  const formatChange = (change: number, isPercentage: boolean = true) => {
    const sign = change > 0 ? '+' : '';
    const colorClass = change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
    const formattedValue = isPercentage ? `${sign}${change.toFixed(1)}%` : `${sign}${change.toFixed(1)}`;
    return <span className={`text-sm font-medium ${colorClass}`}>{formattedValue}</span>;
  };

  // Use metrics state for rendering
  const displayMetrics = metrics ? [
    {
      title: 'Total de Visitantes',
      value: metrics.totalVisitors.toString(),
      change: metrics.totalVisitorsChange, // Use calculated change
      changeType: metrics.totalVisitorsChange > 0 ? 'positive' : metrics.totalVisitorsChange < 0 ? 'negative' : 'neutral', // Determine change type
      icon: Users,
      color: 'from-blue-400 to-blue-500',
      description: 'Em relação ao mês anterior'
    },
    {
      title: 'Novos Visitantes',
      value: metrics.newVisitors.toString(),
      change: metrics.newVisitorsChange, // Use calculated change
      changeType: metrics.newVisitorsChange > 0 ? 'positive' : metrics.newVisitorsChange < 0 ? 'negative' : 'neutral', // Determine change type
      icon: UserPlus,
      color: 'from-green-400 to-green-500',
      description: 'Primeira visita no mês'
    },
    {
      title: 'Mulheres',
      value: metrics.femaleVisitors.toString(),
      change: metrics.femaleVisitorsChange, // Use calculated change
      changeType: metrics.femaleVisitorsChange > 0 ? 'positive' : metrics.femaleVisitorsChange < 0 ? 'negative' : 'neutral', // Determine change type
      icon: User,
      color: 'from-purple-400 to-purple-500',
      description: 'Visitantes do sexo feminino'
    },
    {
      title: 'Taxa de Retenção',
      value: `${metrics.retentionRate.toFixed(0)}%`,
      change: metrics.retentionRateChange, // Use calculated change
      changeType: metrics.retentionRateChange > 0 ? 'positive' : metrics.retentionRateChange < 0 ? 'negative' : 'neutral', // Determine change type
      icon: Target,
      color: 'from-orange-400 to-orange-500',
      description: 'Em relação ao mês anterior' // Assuming this comparison is relevant here too
    },
    {
      title: 'Frequência Média',
      value: `${metrics.averageFrequency.toFixed(1)}x`,
      change: metrics.averageFrequencyChange, // Use calculated change
      changeType: metrics.averageFrequencyChange > 0 ? 'positive' : metrics.averageFrequencyChange < 0 ? 'negative' : 'neutral', // Determine change type
      icon: Calendar,
      color: 'from-pink-400 to-pink-500',
      description: 'Visitas por pessoa'
    },
    {
      title: 'Jovens',
      value: metrics.youngVisitors.toString(),
      change: metrics.youngVisitorsChange, // Use calculated change
      changeType: metrics.youngVisitorsChange > 0 ? 'positive' : metrics.youngVisitorsChange < 0 ? 'negative' : 'neutral', // Determine change type
      icon: Heart,
      color: 'from-red-400 to-red-500',
      description: 'Visitantes de 15 a 30 anos'
    },
    {
      title: 'Homens',
      value: metrics.maleVisitors.toString(),
      change: metrics.maleVisitorsChange, // Use calculated change
      changeType: metrics.maleVisitorsChange > 0 ? 'positive' : metrics.maleVisitorsChange < 0 ? 'negative' : 'neutral', // Determine change type
      icon: User,
      color: 'from-indigo-400 to-indigo-500',
      description: 'Visitantes do sexo masculino'
    },
    {
      title: 'Crescimento',
      value: `${metrics.monthlyGrowthChange.toFixed(1)}%`, // Assuming monthlyGrowthChange is the main growth metric
      change: 0, // Monthly Growth doesn't have a 'change' relative to a previous period in this context
      changeType: metrics.monthlyGrowthChange > 0 ? 'positive' : metrics.monthlyGrowthChange < 0 ? 'negative' : 'neutral', // Determine change type
      icon: TrendingUp,
      color: 'from-cyan-400 to-cyan-500',
      description: 'Crescimento mensal'
    }
  ] : [];

  // Add loading state feedback
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-10 h-10 text-church-primary animate-spin mb-4" />
        <p className="text-gray-700">Carregando métricas...</p>
      </div>
    );
  }

  // Handle case where metrics are null (e.g., error fetching)
  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-600">
        <p>Erro ao carregar métricas.</p>
        <p className="text-gray-500 text-sm">Verifique o console para detalhes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-playfair font-bold gradient-text mb-2">
          Métricas de {months[selectedMonth]} {selectedYear}
        </h2>
        <p className="text-slate-600 font-medium">
          Análise completa do perfil demográfico e engajamento dos visitantes
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:bg-white rounded-lg p-4">
        {displayMetrics.map((metric, index) => (
          <Card key={metric.title} className="hover-lift animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                {metric.title}
              </CardTitle>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800 mb-1">
                {metric.value}
              </div>
              <div className="flex items-center space-x-2">
                {/* Use the helper function to format the change */}
                {formatChange(metric.change, metric.title !== 'Frequência Média' && metric.title !== 'Crescimento')}
                <span className="text-xs text-slate-600 font-medium">
                  {metric.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card - Update to use fetched data */}
      {metrics && (
        <Card className="glass-effect hover-lift">
          <CardHeader>
            <CardTitle className="text-xl font-semibold gradient-text">
              Resumo Executivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-2xl font-bold text-church-primary mb-1">{metrics.totalVisitors}</div>
                <div className="text-sm text-slate-700 font-medium">Total de Visitantes</div>
                <div className={`text-xs ${metrics.totalVisitorsChange > 0 ? 'text-emerald-600' : metrics.totalVisitorsChange < 0 ? 'text-red-600' : 'text-gray-600'} font-medium`}>{metrics.totalVisitorsChange > 0 ? '+' : ''}{metrics.totalVisitorsChange.toFixed(1)}% vs mês anterior</div> {/* Use calculated change */}
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600 mb-1">{metrics.femaleVisitors}</div>
                <div className="text-sm text-slate-700 font-medium">Mulheres</div>
                <div className={`text-xs ${metrics.femaleVisitorsChange > 0 ? 'text-emerald-600' : metrics.femaleVisitorsChange < 0 ? 'text-red-600' : 'text-gray-600'} font-medium`}>{metrics.femaleVisitorsChange > 0 ? '+' : ''}{metrics.femaleVisitorsChange.toFixed(1)}% visitantes</div> {/* Using actual count and calculated change */}
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-indigo-600 mb-1">{metrics.maleVisitors}</div>
                <div className="text-sm text-slate-700 font-medium">Homens</div>
                <div className={`text-xs ${metrics.maleVisitorsChange > 0 ? 'text-emerald-600' : metrics.maleVisitorsChange < 0 ? 'text-red-600' : 'text-gray-600'} font-medium`}>{metrics.maleVisitorsChange > 0 ? '+' : ''}{metrics.maleVisitorsChange.toFixed(1)}% visitantes</div> {/* Using actual count and calculated change */}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-slate-700 leading-relaxed font-medium">
                <strong className="text-slate-800">Perfil demográfico:</strong> O público feminino representa {metrics.totalVisitors > 0 ? ((metrics.femaleVisitors / metrics.totalVisitors) * 100).toFixed(0) : 0}% dos visitantes, 
                com {metrics.femaleVisitors} mulheres registradas no mês. Os jovens (15-30 anos) representam {metrics.totalVisitors > 0 ? ((metrics.youngVisitors / metrics.totalVisitors) * 100).toFixed(0) : 0}% do total, indicando um forte 
                engajamento com a faixa etária mais jovem da comunidade. O crescimento de {metrics.monthlyGrowthChange > 0 ? '+' : ''}{metrics.monthlyGrowthChange.toFixed(1)}% demonstra expansão consistente. {/* Use calculated growth change */}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportMetrics;
