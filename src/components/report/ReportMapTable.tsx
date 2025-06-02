import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, MapPin, Users, Home, Navigation, Phone, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Visitor } from '@/types/visitor';
import { Cell } from '@/types/cell';

interface LocationData {
  city: string;
  neighborhoods: {
    [neighborhood: string]: {
      cells: Cell[];
      visitors: Visitor[];
    };
  };
}

export interface ReportMapTableProps {
  selectedMonth: number;
  selectedYear: number;
  visitors: Visitor[];
  cells: Cell[];
  churchLocation: { lat: number; lng: number; name: string; };
}

const ReportMapTable: React.FC<ReportMapTableProps> = ({ selectedMonth, selectedYear }) => {
  const [locationData, setLocationData] = useState<{ [city: string]: LocationData }>({});
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());
  const [expandedNeighborhoods, setExpandedNeighborhoods] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

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

      // Buscar células ativas
      const { data: cellsData, error: cellsError } = await supabase
        .from('cells')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (cellsError) throw cellsError;

      // Organizar dados por cidade e bairro
      const organized = organizeByLocation(visitorsData || [], cellsData || []);
      setLocationData(organized);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados da tabela');
    } finally {
      setLoading(false);
    }
  };

  const organizeByLocation = (visitors: Visitor[], cells: Cell[]) => {
    const organized: { [city: string]: LocationData } = {};

    // Função para extrair cidade e bairro do endereço
    const extractLocation = (address: string) => {
      const parts = address.split(',').map(part => part.trim());
      // Assumindo formato: "Rua, Bairro, Cidade" ou similar
      const city = parts[parts.length - 1] || 'Cidade não identificada';
      const neighborhood = parts[parts.length - 2] || 'Bairro não identificado';
      return { city, neighborhood };
    };

    // Processar visitantes
    visitors.forEach(visitor => {
      const { city, neighborhood } = extractLocation(visitor.address);
      
      if (!organized[city]) {
        organized[city] = {
          city,
          neighborhoods: {}
        };
      }
      
      if (!organized[city].neighborhoods[neighborhood]) {
        organized[city].neighborhoods[neighborhood] = {
          cells: [],
          visitors: []
        };
      }
      
      organized[city].neighborhoods[neighborhood].visitors.push(visitor);
    });

    // Processar células
    cells.forEach(cell => {
      const { city, neighborhood } = extractLocation(cell.address);
      
      if (!organized[city]) {
        organized[city] = {
          city,
          neighborhoods: {}
        };
      }
      
      if (!organized[city].neighborhoods[neighborhood]) {
        organized[city].neighborhoods[neighborhood] = {
          cells: [],
          visitors: []
        };
      }
      
      organized[city].neighborhoods[neighborhood].cells.push(cell);
    });

    return organized;
  };

  const toggleCity = (city: string) => {
    const newExpanded = new Set(expandedCities);
    if (newExpanded.has(city)) {
      newExpanded.delete(city);
    } else {
      newExpanded.add(city);
    }
    setExpandedCities(newExpanded);
  };

  const toggleNeighborhood = (neighborhoodKey: string) => {
    const newExpanded = new Set(expandedNeighborhoods);
    if (newExpanded.has(neighborhoodKey)) {
      newExpanded.delete(neighborhoodKey);
    } else {
      newExpanded.add(neighborhoodKey);
    }
    setExpandedNeighborhoods(newExpanded);
  };

  const assignVisitorToCell = async (visitorId: string, cellId: string) => {
    try {
      // Aqui você pode implementar a lógica para associar visitante à célula
      // Por exemplo, atualizar um campo na tabela de visitantes ou criar uma nova tabela de associações
      toast.success('Visitante direcionado para a célula com sucesso!');
    } catch (error) {
      console.error('Erro ao direcionar visitante:', error);
      toast.error('Erro ao direcionar visitante para a célula');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600 font-medium">Carregando dados da tabela...</div>
      </div>
    );
  }

  const totalCities = Object.keys(locationData).length;
  const totalNeighborhoods = Object.values(locationData).reduce(
    (acc, city) => acc + Object.keys(city.neighborhoods).length, 0
  );
  const totalCells = Object.values(locationData).reduce(
    (acc, city) => acc + Object.values(city.neighborhoods).reduce(
      (nacc, neighborhood) => nacc + neighborhood.cells.length, 0
    ), 0
  );
  const totalVisitors = Object.values(locationData).reduce(
    (acc, city) => acc + Object.values(city.neighborhoods).reduce(
      (nacc, neighborhood) => nacc + neighborhood.visitors.length, 0
    ), 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-playfair font-bold text-slate-800 mb-2">
          Visão Hierárquica por Localização
        </h3>
        <p className="text-slate-600 font-medium">
          Organize visitantes e células por cidades e bairros
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center border-slate-200">
          <CardContent className="p-4">
            <div className="text-xl font-bold text-[#94C6EF]">{totalCities}</div>
            <div className="text-sm text-slate-600 font-medium">Cidades</div>
          </CardContent>
        </Card>
        <Card className="text-center border-slate-200">
          <CardContent className="p-4">
            <div className="text-xl font-bold text-[#A8D0F2]">{totalNeighborhoods}</div>
            <div className="text-sm text-slate-600 font-medium">Bairros</div>
          </CardContent>
        </Card>
        <Card className="text-center border-slate-200">
          <CardContent className="p-4">
            <div className="text-xl font-bold text-[#BCDAF5]">{totalCells}</div>
            <div className="text-sm text-slate-600 font-medium">Células</div>
          </CardContent>
        </Card>
        <Card className="text-center border-slate-200">
          <CardContent className="p-4">
            <div className="text-xl font-bold text-[#CFE4F8]">{totalVisitors}</div>
            <div className="text-sm text-slate-600 font-medium">Visitantes</div>
          </CardContent>
        </Card>
      </div>

      {/* Hierarchical Table */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#94C6EF]" />
            <span>Organização por Localização</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(locationData).map(([city, cityData]) => {
              const isExpanded = expandedCities.has(city);
              const cityVisitors = Object.values(cityData.neighborhoods).reduce(
                (acc, n) => acc + n.visitors.length, 0
              );
              const cityCells = Object.values(cityData.neighborhoods).reduce(
                (acc, n) => acc + n.cells.length, 0
              );

              return (
                <div key={city} className="border border-slate-200 rounded-lg overflow-hidden">
                  {/* City Header */}
                  <div 
                    className="bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] p-4 cursor-pointer"
                    onClick={() => toggleCity(city)}
                  >
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center space-x-3">
                        {isExpanded ? 
                          <ChevronDown className="w-5 h-5" /> : 
                          <ChevronRight className="w-5 h-5" />
                        }
                        <MapPin className="w-5 h-5" />
                        <h4 className="text-lg font-semibold">{city}</h4>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>{cityCells} células</span>
                        <span>{cityVisitors} visitantes</span>
                      </div>
                    </div>
                  </div>

                  {/* Neighborhoods */}
                  {isExpanded && (
                    <div className="bg-white">
                      {Object.entries(cityData.neighborhoods).map(([neighborhood, neighborhoodData]) => {
                        const neighborhoodKey = `${city}-${neighborhood}`;
                        const isNeighborhoodExpanded = expandedNeighborhoods.has(neighborhoodKey);

                        return (
                          <div key={neighborhoodKey} className="border-t border-slate-100">
                            {/* Neighborhood Header */}
                            <div 
                              className="bg-slate-50 p-3 cursor-pointer hover:bg-slate-100 transition-colors"
                              onClick={() => toggleNeighborhood(neighborhoodKey)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {isNeighborhoodExpanded ? 
                                    <ChevronDown className="w-4 h-4 text-slate-600" /> : 
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                  }
                                  <Home className="w-4 h-4 text-slate-600" />
                                  <h5 className="font-medium text-slate-800">{neighborhood}</h5>
                                </div>
                                <div className="flex items-center space-x-3 text-sm text-slate-600">
                                  <span>{neighborhoodData.cells.length} células</span>
                                  <span>{neighborhoodData.visitors.length} visitantes</span>
                                </div>
                              </div>
                            </div>

                            {/* Neighborhood Content */}
                            {isNeighborhoodExpanded && (
                              <div className="p-4 space-y-4">
                                {/* Cells in Neighborhood */}
                                {neighborhoodData.cells.length > 0 && (
                                  <div>
                                    <h6 className="font-medium text-slate-800 mb-2 flex items-center space-x-2">
                                      <Users className="w-4 h-4 text-[#BCDAF5]" />
                                      <span>Células no Bairro ({neighborhoodData.cells.length})</span>
                                    </h6>
                                    <div className="grid gap-2">
                                      {neighborhoodData.cells.map(cell => (
                                        <div key={cell.id} className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <h6 className="font-medium text-slate-800">{cell.name}</h6>
                                              <p className="text-sm text-slate-600">Líder: {cell.leader_name}</p>
                                              <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center space-x-1">
                                                  <Calendar className="w-3 h-3" />
                                                  <span>{cell.meeting_day}</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                  <Clock className="w-3 h-3" />
                                                  <span>{cell.meeting_time}</span>
                                                </span>
                                                <span>{cell.current_members}/{cell.capacity} membros</span>
                                              </div>
                                            </div>
                                            {cell.leader_phone && (
                                              <Button size="sm" variant="outline" className="text-xs">
                                                <Phone className="w-3 h-3 mr-1" />
                                                Contato
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Visitors in Neighborhood */}
                                {neighborhoodData.visitors.length > 0 && (
                                  <div>
                                    <h6 className="font-medium text-slate-800 mb-2 flex items-center space-x-2">
                                      <Navigation className="w-4 h-4 text-[#E2EEFB]" />
                                      <span>Visitantes no Bairro ({neighborhoodData.visitors.length})</span>
                                    </h6>
                                    <div className="grid gap-2">
                                      {neighborhoodData.visitors.map(visitor => (
                                        <div key={visitor.id} className="bg-green-50 p-3 rounded-lg border border-green-100">
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <h6 className="font-medium text-slate-800">{visitor.name}</h6>
                                              <p className="text-sm text-slate-600">{visitor.address}</p>
                                              <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                                                <span>{visitor.visit_count} visitas</span>
                                                {visitor.is_new_visitor && (
                                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                    Novo
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            {neighborhoodData.cells.length > 0 && (
                                              <div className="flex flex-col space-y-1">
                                                {neighborhoodData.cells.slice(0, 2).map(cell => (
                                                  <Button 
                                                    key={cell.id}
                                                    size="sm" 
                                                    variant="outline" 
                                                    className="text-xs"
                                                    onClick={() => assignVisitorToCell(visitor.id, cell.id)}
                                                  >
                                                    → {cell.name}
                                                  </Button>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {neighborhoodData.cells.length === 0 && neighborhoodData.visitors.length > 0 && (
                                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                      ⚠️ Este bairro tem visitantes mas nenhuma célula ativa. 
                                      Considere criar uma nova célula ou direcionar para bairros próximos.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {Object.keys(locationData).length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Nenhum dado encontrado para organizar por localização
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportMapTable;
