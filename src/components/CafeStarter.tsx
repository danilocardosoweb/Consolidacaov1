import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Coffee, Users, UserCheck, TrendingUp, Plus, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CafeStarterProps {
  onNavigate: (view: string) => void;
}

interface Visitor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address: string;
  created_at: string;
  is_new_visitor: boolean;
  metadata?: {
    cafe_starter?: {
      participated: boolean;
      retained: boolean;
      event_date: string;
      notes?: string;
    };
  };
}

interface CafeEvent {
  id: string;
  visitor_id: string;
  participated: boolean;
  retained: boolean;
  notes?: string;
  event_date: string;
  visitor: Visitor;
}

const CafeStarter: React.FC<CafeStarterProps> = ({ onNavigate }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [cafeEvents, setCafeEvents] = useState<CafeEvent[]>([]);
  const [selectedVisitors, setSelectedVisitors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'new' | 'participating'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar visitantes
      const { data: visitorsData, error: visitorsError } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (visitorsError) throw visitorsError;

      // Converter os dados e fazer type casting seguro do metadata
      const visitorsWithCafe = visitorsData?.map(visitor => ({
        ...visitor,
        metadata: visitor.metadata as Visitor['metadata']
      })) || [];

      setVisitors(visitorsWithCafe);
      
      // Simular eventos do café baseado nos dados existentes
      const mockCafeEvents = visitorsWithCafe
        .filter(v => v.metadata?.cafe_starter)
        .map(v => ({
          id: `cafe-${v.id}`,
          visitor_id: v.id,
          participated: v.metadata?.cafe_starter?.participated || false,
          retained: v.metadata?.cafe_starter?.retained || false,
          notes: v.metadata?.cafe_starter?.notes || '',
          event_date: v.metadata?.cafe_starter?.event_date || new Date().toISOString(),
          visitor: v
        }));

      setCafeEvents(mockCafeEvents);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const addToCafeEvent = async (visitorIds: string[]) => {
    try {
      const updates = visitorIds.map(async (visitorId) => {
        const visitor = visitors.find(v => v.id === visitorId);
        if (!visitor) return;

        const cafeData = {
          participated: true,
          retained: false,
          event_date: new Date().toISOString(),
          notes: ''
        };

        const updatedMetadata = {
          ...visitor.metadata,
          cafe_starter: cafeData
        };

        return supabase
          .from('visitors')
          .update({ metadata: updatedMetadata })
          .eq('id', visitorId);
      });

      await Promise.all(updates);
      toast.success(`${visitorIds.length} visitante(s) adicionado(s) ao Café Starter`);
      setSelectedVisitors([]);
      fetchData();
    } catch (error) {
      console.error('Erro ao adicionar ao evento:', error);
      toast.error('Erro ao adicionar visitantes ao evento');
    }
  };

  const updateRetentionStatus = async (visitorId: string, retained: boolean) => {
    try {
      const visitor = visitors.find(v => v.id === visitorId);
      if (!visitor) return;

      const cafeData = {
        ...visitor.metadata?.cafe_starter,
        retained
      };

      const updatedMetadata = {
        ...visitor.metadata,
        cafe_starter: cafeData
      };

      await supabase
        .from('visitors')
        .update({ metadata: updatedMetadata })
        .eq('id', visitorId);

      toast.success(`Status de retenção ${retained ? 'marcado' : 'desmarcado'}`);
      fetchData();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status de retenção');
    }
  };

  const filteredVisitors = visitors.filter(visitor => {
    const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isInCafe = cafeEvents.some(event => event.visitor_id === visitor.id);
    
    if (filterType === 'new' && !visitor.is_new_visitor) return false;
    if (filterType === 'participating' && !isInCafe) return false;
    
    return matchesSearch;
  });

  const stats = {
    totalParticipants: cafeEvents.length,
    retained: cafeEvents.filter(event => event.retained).length,
    retentionRate: cafeEvents.length > 0 ? 
      ((cafeEvents.filter(event => event.retained).length / cafeEvents.length) * 100).toFixed(1) : '0'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-lg text-slate-600 font-medium">Carregando dados do Café Starter...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-playfair font-bold text-slate-800">
                  Café Starter
                </h1>
                <p className="text-sm sm:text-base text-slate-600 font-medium">
                  Evento para retenção de visitantes
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => selectedVisitors.length > 0 && addToCafeEvent(selectedVisitors)}
              disabled={selectedVisitors.length === 0}
              className="bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar ao Evento ({selectedVisitors.length})
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:bg-white rounded-lg p-4">
          <Card className="border-slate-200">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-slate-800">{stats.totalParticipants}</h3>
                <p className="text-sm text-slate-600">Participantes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-slate-800">{stats.retained}</h3>
                <p className="text-sm text-slate-600">Retidos</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-slate-800">{stats.retentionRate}%</h3>
                <p className="text-sm text-slate-600">Taxa de Retenção</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar visitantes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#94C6EF]/50"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={filterType === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('new')}
                >
                  Novos
                </Button>
                <Button
                  variant={filterType === 'participating' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('participating')}
                >
                  Participando
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Visitantes */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Visitantes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {filteredVisitors.map(visitor => {
                const isInCafe = cafeEvents.some(event => event.visitor_id === visitor.id);
                const cafeEvent = cafeEvents.find(event => event.visitor_id === visitor.id);
                
                return (
                  <div
                    key={visitor.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedVisitors.includes(visitor.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedVisitors([...selectedVisitors, visitor.id]);
                            } else {
                              setSelectedVisitors(selectedVisitors.filter(id => id !== visitor.id));
                            }
                          }}
                          disabled={isInCafe}
                          className="w-4 h-4 text-[#94C6EF] rounded"
                        />
                        <div>
                          <h4 className="font-medium text-slate-800">{visitor.name}</h4>
                          <p className="text-sm text-slate-600">{visitor.address}</p>
                          {visitor.is_new_visitor && (
                            <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full mt-1">
                              Novo Visitante
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isInCafe && (
                          <>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Participando
                            </span>
                            <Button
                              size="sm"
                              variant={cafeEvent?.retained ? "default" : "outline"}
                              onClick={() => updateRetentionStatus(visitor.id, !cafeEvent?.retained)}
                              className="text-xs"
                            >
                              {cafeEvent?.retained ? 'Retido' : 'Marcar como Retido'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredVisitors.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  Nenhum visitante encontrado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CafeStarter;
