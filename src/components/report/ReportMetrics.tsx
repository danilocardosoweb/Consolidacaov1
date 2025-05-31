
import React from 'react';
import { Users, UserPlus, Calendar, TrendingUp, UserCheck, Clock, Heart, Target, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ReportMetricsProps {
  selectedMonth: number;
  selectedYear: number;
}

const ReportMetrics: React.FC<ReportMetricsProps> = ({ selectedMonth, selectedYear }) => {
  // Mock data - em uma aplicação real, viria de uma API
  const metrics = [
    {
      title: 'Total de Visitantes',
      value: '247',
      change: '+18%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'from-blue-400 to-blue-500',
      description: 'Em relação ao mês anterior'
    },
    {
      title: 'Novos Visitantes',
      value: '89',
      change: '+23%',
      changeType: 'positive' as const,
      icon: UserPlus,
      color: 'from-green-400 to-green-500',
      description: 'Primeira visita no mês'
    },
    {
      title: 'Mulheres',
      value: '158',
      change: '+12%',
      changeType: 'positive' as const,
      icon: User,
      color: 'from-purple-400 to-purple-500',
      description: 'Visitantes do sexo feminino'
    },
    {
      title: 'Taxa de Retenção',
      value: '64%',
      change: '+5%',
      changeType: 'positive' as const,
      icon: Target,
      color: 'from-orange-400 to-orange-500',
      description: 'Visitantes que retornaram'
    },
    {
      title: 'Frequência Média',
      value: '2.3x',
      change: '+0.4',
      changeType: 'positive' as const,
      icon: Calendar,
      color: 'from-pink-400 to-pink-500',
      description: 'Visitas por pessoa'
    },
    {
      title: 'Jovens',
      value: '87',
      change: '+7%',
      changeType: 'positive' as const,
      icon: Heart,
      color: 'from-red-400 to-red-500',
      description: 'Visitantes de 15 a 30 anos'
    },
    {
      title: 'Homens',
      value: '89',
      change: '+15',
      changeType: 'positive' as const,
      icon: User,
      color: 'from-indigo-400 to-indigo-500',
      description: 'Visitantes do sexo masculino'
    },
    {
      title: 'Crescimento',
      value: '+18%',
      change: '+3%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'from-cyan-400 to-cyan-500',
      description: 'Crescimento mensal'
    }
  ];

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
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
                <span className={`text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  {metric.description}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card className="glass-effect hover-lift">
        <CardHeader>
          <CardTitle className="text-xl font-semibold gradient-text">
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="text-2xl font-bold text-church-primary mb-1">247</div>
              <div className="text-sm text-slate-700 font-medium">Total de Visitantes</div>
              <div className="text-xs text-emerald-600 font-medium">+18% vs mês anterior</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 mb-1">64%</div>
              <div className="text-sm text-slate-700 font-medium">Mulheres</div>
              <div className="text-xs text-emerald-600 font-medium">158 visitantes</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-indigo-600 mb-1">36%</div>
              <div className="text-sm text-slate-700 font-medium">Homens</div>
              <div className="text-xs text-emerald-600 font-medium">89 visitantes</div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-slate-700 leading-relaxed font-medium">
              <strong className="text-slate-800">Perfil demográfico:</strong> O público feminino representa 64% dos visitantes, 
              com 158 mulheres registradas no mês. Os jovens (15-30 anos) representam 35% do total, indicando um forte 
              engajamento com a faixa etária mais jovem da comunidade. O crescimento de 18% demonstra expansão consistente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportMetrics;
