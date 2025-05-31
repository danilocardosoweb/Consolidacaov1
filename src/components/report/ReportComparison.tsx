
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, TrendingDown, ArrowRight, Calendar, Users, Target } from 'lucide-react';

interface ReportComparisonProps {
  selectedMonth: number;
  selectedYear: number;
}

const ReportComparison: React.FC<ReportComparisonProps> = ({ selectedMonth, selectedYear }) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const previousMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const previousYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;

  const comparisons = [
    {
      metric: 'Total de Visitantes',
      current: 247,
      previous: 209,
      change: 18.2,
      unit: '',
      icon: Users,
      color: 'blue'
    },
    {
      metric: 'Novos Visitantes',
      current: 89,
      previous: 72,
      change: 23.6,
      unit: '',
      icon: Users,
      color: 'green'
    },
    {
      metric: 'Taxa de Retenção',
      current: 64,
      previous: 61,
      change: 4.9,
      unit: '%',
      icon: Target,
      color: 'purple'
    },
    {
      metric: 'Frequência Média',
      current: 2.3,
      previous: 1.9,
      change: 21.1,
      unit: 'x',
      icon: Calendar,
      color: 'orange'
    },
    {
      metric: 'Engajamento',
      current: 87,
      previous: 81,
      change: 7.4,
      unit: '%',
      icon: TrendingUp,
      color: 'pink'
    },
    {
      metric: 'Tempo Médio (min)',
      current: 105,
      previous: 90,
      change: 16.7,
      unit: 'min',
      icon: Calendar,
      color: 'indigo'
    }
  ];

  const yearComparison = [
    { period: 'Jan-Jun 2024', visitors: 1247, growth: 18.5 },
    { period: 'Jan-Jun 2023', visitors: 1052, growth: 12.3 },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50',
      green: 'from-green-500 to-green-600 text-green-600 bg-green-50',
      purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50',
      orange: 'from-orange-500 to-orange-600 text-orange-600 bg-orange-50',
      pink: 'from-pink-500 to-pink-600 text-pink-600 bg-pink-50',
      indigo: 'from-indigo-500 to-indigo-600 text-indigo-600 bg-indigo-50',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-playfair font-bold gradient-text mb-2">
          Análise Comparativa
        </h2>
        <p className="text-gray-600">
          {months[selectedMonth]} {selectedYear} vs {months[previousMonth]} {previousYear}
        </p>
      </div>

      {/* Monthly Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comparisons.map((item, index) => {
          const colorClasses = getColorClasses(item.color);
          const isPositive = item.change > 0;
          
          return (
            <Card key={item.metric} className="hover-lift animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {item.metric}
                  </CardTitle>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colorClasses.split(' ').slice(0, 2).join(' ')} flex items-center justify-center`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {item.current}{item.unit}
                    </div>
                    <div className="text-sm text-gray-500">
                      Atual
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-lg font-semibold text-gray-700">
                      {item.previous}{item.unit}
                    </div>
                    <div className="text-sm text-gray-500">
                      Anterior
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-center justify-center p-2 rounded-lg ${colorClasses.split(' ').slice(-1)[0]}`}>
                  {isPositive ? (
                    <TrendingUp className={`w-4 h-4 mr-1 ${colorClasses.split(' ')[2]}`} />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1 text-red-600" />
                  )}
                  <span className={`font-semibold ${isPositive ? colorClasses.split(' ')[2] : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{item.change.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Year over Year Comparison */}
      <Card className="glass-effect hover-lift">
        <CardHeader>
          <CardTitle className="text-xl font-semibold gradient-text">
            Comparativo Anual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {yearComparison.map((year, index) => (
              <div key={year.period} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {year.period}
                  </h3>
                  <div className="text-3xl font-bold gradient-text">
                    {year.visitors.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">visitantes</div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                  <div className="flex items-center justify-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-600">
                      +{year.growth}% crescimento
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800 mb-2">
                Crescimento Acumulado
              </div>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-2xl font-bold text-green-600">+18.5%</div>
                <div className="text-gray-600">vs ano anterior</div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Representando 195 visitantes adicionais comparado ao mesmo período do ano passado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass-effect hover-lift">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Tendência Positiva
            </h3>
            <p className="text-gray-600 text-sm">
              Crescimento consistente em todas as métricas principais
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Engajamento Alto
            </h3>
            <p className="text-gray-600 text-sm">
              Taxa de retenção acima da média do setor
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Metas Superadas
            </h3>
            <p className="text-gray-600 text-sm">
              Todos os objetivos mensais foram atingidos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportComparison;
