import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Calendar, TrendingUp, BarChart3, Home, Menu, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

interface Stat {
  title: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
}

interface Visitor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address: string;
  created_at: string;
  visit_count: number;
  is_new_visitor: boolean;
  distance: number;
  lat: number;
  lng: number;
  status: string;
  updated_at: string;
  metadata?: any;
  generation?: string;
  gender?: string;
  ageGroup?: string;
}

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  index: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, index }) => (
  <Card className="hover-lift animate-scale-in border-slate-200 transition-all duration-300 hover:shadow-md" style={{ animationDelay: `${index * 100}ms` }}>
    <CardContent className="p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">{value}</h3>
        <p className="text-xs sm:text-sm text-slate-600 truncate">{title}</p>
      </div>
    </CardContent>
  </Card>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<Stat[]>([
    { title: 'Total de Visitantes', value: '0', icon: Users, color: 'from-blue-400 to-blue-500' },
    { title: 'Novos Visitantes', value: '0', icon: UserPlus, color: 'from-green-400 to-green-500' },
    { title: 'Média de Visitas', value: '0', icon: Calendar, color: 'from-purple-400 to-purple-500' },
    { title: 'Taxa de Retorno', value: '0%', icon: TrendingUp, color: 'from-orange-400 to-orange-500' },
  ]);
  const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const endMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
      const endYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
      const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
      const { data: visitors, error: visitorsError } = await supabase
        .from('visitors')
        .select('*')
        .gte('created_at', startDate)
        .lt('created_at', endDate);

      if (visitorsError) {
        console.error("Erro ao buscar visitantes:", visitorsError);
        return;
      }

      const visitorsMapped = (visitors || []).map(v => {
        let metadata = v.metadata;
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata);
          } catch {
            metadata = {};
          }
        }
        return {
          ...v,
          generation: metadata?.generation || '',
          gender: metadata?.gender || '',
          ageGroup: metadata?.ageGroup || '',
        };
      });

      const totalVisitors = visitorsMapped.length;
      const newVisitors = visitorsMapped.filter(visitor => {
        const createdAt = new Date(visitor.created_at);
        const now = new Date();
        const diff = now.getTime() - createdAt.getTime();
        const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
        return diffDays <= 30;
      }).length || 0;

      const avgVisits = totalVisitors > 0 ? (totalVisitors / 30).toFixed(1) : '0';
      const returnRate = totalVisitors > 0 ? ((totalVisitors - newVisitors) / totalVisitors * 100).toFixed(1) + '%' : '0%';

      setStats([
        { title: 'Total de Visitantes', value: String(totalVisitors), icon: Users, color: 'from-blue-400 to-blue-500' },
        { title: 'Novos Visitantes', value: String(newVisitors), icon: UserPlus, color: 'from-green-400 to-green-500' },
        { title: 'Média de Visitas', value: avgVisits, icon: Calendar, color: 'from-purple-400 to-purple-500' },
        { title: 'Taxa de Retorno', value: returnRate, icon: TrendingUp, color: 'from-orange-400 to-orange-500' },
      ]);

      const recent = [...visitorsMapped]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentVisitors(recent);
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Novo Visitante',
      description: 'Cadastrar um novo visitante',
      icon: UserPlus,
      color: 'from-[#94C6EF] to-[#A8D0F2]',
      action: () => onNavigate('form')
    },
    {
      title: 'Ver Visitantes',
      description: 'Lista completa de visitantes',
      icon: Users,
      color: 'from-[#A8D0F2] to-[#BCDAF5]',
      action: () => onNavigate('visitors')
    },
    {
      title: 'Células',
      description: 'Gerenciar grupos de casa',
      icon: Home,
      color: 'from-[#BCDAF5] to-[#CFE4F8]',
      action: () => onNavigate('cells')
    },
    {
      title: 'Café Starter',
      description: 'Evento para retenção de visitantes',
      icon: Calendar,
      color: 'from-[#CFE4F8] to-[#E2EEFB]',
      action: () => onNavigate('cafe-starter')
    },
    {
      title: 'Relatórios',
      description: 'Análises e métricas',
      icon: BarChart3,
      color: 'from-[#E2EEFB] to-[#F1F8FE]',
      action: () => onNavigate('report')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-playfair font-bold text-slate-800">
                  Sistema de Visitantes
                </h1>
                <p className="text-sm sm:text-base text-slate-600 font-medium hidden sm:block">
                  Gerencie e acompanhe os visitantes da sua igreja
                </p>
              </div>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden lg:flex space-x-3">
              <Button
                onClick={() => onNavigate('cells')}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white hover:opacity-90 transition-all"
              >
                <Home className="w-4 h-4" />
                <span>Gerenciar Células</span>
              </Button>
              <Button
                onClick={() => onNavigate('cafe-starter')}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#BCDAF5] to-[#CFE4F8] text-white hover:opacity-90 transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Café Starter</span>
              </Button>
              <Button
                onClick={() => onNavigate('form')}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white hover:opacity-90 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Novo Visitante</span>
              </Button>
            </div>

            {/* Mobile Action Button */}
            <div className="lg:hidden">
              <Button
                onClick={() => onNavigate('form')}
                size="sm"
                className="bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white hover:opacity-90"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t space-y-2 animate-fade-in">
              {quickActions.map((action, index) => (
                <button
                  key={action.title}
                  onClick={() => {
                    action.action();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{action.title}</p>
                    <p className="text-sm text-slate-600">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={stat.title} {...stat} index={index} />
          ))}
        </div>

        {/* Quick Actions - Desktop Grid */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-6">
          {quickActions.map((action, index) => (
            <Card 
              key={action.title}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-[#94C6EF]/50 group"
              onClick={action.action}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{action.title}</h3>
                <p className="text-sm text-slate-600">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Visitors */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-playfair font-semibold text-slate-800">
              Visitantes Recentes
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('visitors')}
              className="text-[#94C6EF] border-[#94C6EF] hover:bg-[#94C6EF]/10"
            >
              Ver Todos
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="border-slate-200 animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentVisitors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentVisitors.map(visitor => (
                <Card key={visitor.id} className="border-slate-200 hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-4">
                    <div className="font-semibold text-slate-800">{visitor.name}</div>
                    {visitor.generation && (
                      <div className="inline-block text-xs font-medium rounded px-2 py-0.5 bg-purple-100 text-purple-700 mr-2 mt-1">
                        {visitor.generation}
                      </div>
                    )}
                    {visitor.email && <p className="text-sm text-slate-500 truncate mb-1">{visitor.email}</p>}
                    {visitor.phone && <p className="text-sm text-slate-500 mb-1">{visitor.phone}</p>}
                    <p className="text-sm text-slate-500 truncate">{visitor.address}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-slate-400">
                        {new Date(visitor.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {visitor.is_new_visitor && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Novo
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-slate-200">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Nenhum visitante cadastrado ainda</p>
                <Button
                  onClick={() => onNavigate('form')}
                  className="bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white hover:opacity-90"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Cadastrar Primeiro Visitante
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
