import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MapPin, Users, Navigation, Filter, Eye, Home, Church, Map, Table } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReportMapTable from './ReportMapTable';

interface ReportMapProps {
  selectedMonth: number;
  selectedYear: number;
}

interface Visitor {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  visit_count: number;
  is_new_visitor: boolean;
  distance: number;
  generation: string;
}

interface Cell {
  id: string;
  name: string;
  leader_name: string;
  leader_phone?: string;
  address: string;
  lat: number;
  lng: number;
  meeting_day: string;
  meeting_time: string;
  capacity: number;
  current_members: number;
  is_active: boolean;
}

const GENERATIONS = [
  { value: 'Atos', color: '#7C3AED' },
  { value: 'Efraim', color: '#F59E42' },
  { value: 'Israel', color: '#10B981' },
  { value: 'José', color: '#F43F5E' },
  { value: 'Josué', color: '#6366F1' },
  { value: 'Kairó', color: '#FBBF24' },
  { value: 'Levi', color: '#0EA5E9' },
  { value: 'Moriah', color: '#A21CAF' },
  { value: 'Rafah', color: '#F472B6' },
  { value: 'Samuel', color: '#22D3EE' },
  { value: 'Zion', color: '#84CC16' },
  { value: 'Zoe', color: '#F87171' },
];

const ReportMap: React.FC<ReportMapProps> = ({ selectedMonth, selectedYear }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'new' | 'recurring'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChurch, setShowChurch] = useState(true);
  const [showVisitors, setShowVisitors] = useState(true);
  const [showCells, setShowCells] = useState(true);
  const [activeGenerations, setActiveGenerations] = useState<string[]>(GENERATIONS.map(g => g.value));

  // Igreja central - coordenadas de exemplo (São Paulo, SP)
  const churchLocation = {
    lat: -23.5505,
    lng: -46.6333,
    name: "Nossa Igreja"
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || loading || viewMode !== 'map') return;

    initializeMap();
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [loading, selectedFilter, viewMode]);

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

      setVisitors((visitorsData || []).map((v: Record<string, any>) => ({ ...v, generation: v.generation || '' }) as Visitor));
      setCells(cellsData || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados do mapa');
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current) return;

    map.current = L.map(mapContainer.current).setView(
      [churchLocation.lat, churchLocation.lng],
      12
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    // Igreja
    if (showChurch) {
      const churchIcon = L.divIcon({
        html: `<div style="width: 24px; height: 24px; background: #94C6EF; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><div style="color: white; font-size: 14px; font-weight: bold;">⛪</div></div>` ,
        className: 'custom-church-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      L.marker([churchLocation.lat, churchLocation.lng], { icon: churchIcon })
        .addTo(map.current)
        .bindPopup(`<div style="font-family: Inter, sans-serif;"><h3 style="margin: 0 0 8px 0; color: #1e293b; font-weight: bold;">${churchLocation.name}</h3><p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">Centro da Comunidade</p></div>`);
    }

    // Células
    if (showCells) {
      cells.forEach(cell => {
        const cellIcon = L.divIcon({
          html: `<div style="width: 20px; height: 20px; background: #BCDAF5; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);"><div style="color: #1e293b; font-size: 10px; font-weight: bold;">🏠</div></div>` ,
          className: 'custom-cell-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        L.marker([cell.lat, cell.lng], { icon: cellIcon })
          .addTo(map.current!)
          .bindPopup(`<div style="font-family: Inter, sans-serif; max-width: 250px;"><h4 style="margin: 0 0 8px 0; color: #1e293b; font-weight: bold;">${cell.name}</h4><div style="margin-bottom: 6px;"><strong style="color: #475569;">Líder:</strong> ${cell.leader_name}</div></div>`);
      });
    }

    // Visitantes (por geração)
    if (showVisitors) {
      visitors.forEach(visitor => {
        if (!activeGenerations.includes(visitor.generation)) return;
        const gen = GENERATIONS.find(g => g.value === visitor.generation);
        const color = gen ? gen.color : '#A8D0F2';
        const visitorIcon = L.divIcon({
          html: `<div style="width: 16px; height: 16px; background: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.2);"></div>` ,
          className: 'custom-visitor-icon',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        L.marker([visitor.lat, visitor.lng], { icon: visitorIcon })
          .addTo(map.current!)
          .bindPopup(`<div style="font-family: Inter, sans-serif; max-width: 220px;"><h4 style="margin: 0 0 8px 0; color: #1e293b; font-weight: bold;">${visitor.name}</h4><div style="margin-bottom: 6px; color: #475569;">${visitor.address}</div><div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span style="color: #64748b;">Geração:</span><span style="color: #1e293b; font-weight: bold;">${visitor.generation}</span></div></div>`);
      });
    }

    // Ajustar zoom para mostrar todos os pontos filtrados
    const markers = [];
    if (showChurch) markers.push(L.marker([churchLocation.lat, churchLocation.lng]));
    if (showCells) cells.forEach(cell => markers.push(L.marker([cell.lat, cell.lng])));
    if (showVisitors) visitors.forEach(visitor => {
      if (activeGenerations.includes(visitor.generation)) markers.push(L.marker([visitor.lat, visitor.lng]));
    });
    if (markers.length > 0) {
      const group = new L.FeatureGroup(markers);
      map.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const filteredVisitors = visitors.filter(visitor => {
    if (selectedFilter === 'new') return visitor.is_new_visitor;
    if (selectedFilter === 'recurring') return !visitor.is_new_visitor;
    return true;
  });

  const stats = {
    total: filteredVisitors.length,
    new: filteredVisitors.filter(v => v.is_new_visitor).length,
    recurring: filteredVisitors.filter(v => !v.is_new_visitor).length,
    avgDistance: filteredVisitors.length > 0 
      ? (filteredVisitors.reduce((sum, v) => sum + v.distance, 0) / filteredVisitors.length).toFixed(1) 
      : '0'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600 font-medium">Carregando mapa...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-playfair font-bold text-slate-800 mb-2">
          Mapa de Visitantes e Células
        </h2>
        <p className="text-slate-600 font-medium">
          Visualização da distribuição geográfica da comunidade
        </p>
      </div>

      {/* View Mode Toggle */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* View Mode Buttons */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-700">Visualização:</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all font-medium ${
                    viewMode === 'map'
                      ? 'bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  <span>Mapa</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all font-medium ${
                    viewMode === 'table'
                      ? 'bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Table className="w-4 h-4" />
                  <span>Tabela</span>
                </button>
              </div>
            </div>

            {/* Filters - Only show in map mode */}
            {viewMode === 'map' && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">Filtro:</span>
                </div>
                <div className="flex space-x-2">
                  {[
                    { key: 'all', label: 'Todos', icon: Users },
                    { key: 'new', label: 'Novos', icon: Eye },
                    { key: 'recurring', label: 'Recorrentes', icon: Navigation }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setSelectedFilter(key as any)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-all font-medium ${
                        selectedFilter === key
                          ? 'bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters before the map */}
      <Card className="border-slate-200 mb-4">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-semibold text-slate-700 mr-2 flex items-center"><Filter className="w-4 h-4 mr-1" /> Filtros:</span>
            <button
              className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center justify-center ${showChurch ? 'bg-[#94C6EF] text-white' : 'bg-white text-[#94C6EF] border-[#94C6EF]'}`}
              onClick={() => setShowChurch(v => !v)}
            >Igreja</button>
            <button
              className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center justify-center ${showVisitors ? 'bg-[#A8D0F2] text-white' : 'bg-white text-[#A8D0F2] border-[#A8D0F2]'}`}
              onClick={() => setShowVisitors(v => !v)}
            >Visitantes</button>
            <button
              className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center justify-center ${showCells ? 'bg-[#BCDAF5] text-white' : 'bg-white text-[#BCDAF5] border-[#BCDAF5]'}`}
              onClick={() => setShowCells(v => !v)}
            >Células</button>
            {GENERATIONS.map(gen => (
              <button
                key={gen.value}
                className={`px-3 py-1 rounded-full border text-sm font-medium flex items-center justify-center gap-1 ${activeGenerations.includes(gen.value) ? '' : 'opacity-40'} `}
                style={{ background: activeGenerations.includes(gen.value) ? gen.color : '#fff', color: activeGenerations.includes(gen.value) ? '#fff' : gen.color, borderColor: gen.color }}
                onClick={() => setActiveGenerations(gens => gens.includes(gen.value) ? gens.filter(g => g !== gen.value) : [...gens, gen.value])}
              >
                <span style={{ width: 12, height: 12, borderRadius: 6, background: gen.color, display: 'inline-block' }} />
                {gen.value}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <ReportMapTable selectedMonth={selectedMonth} selectedYear={selectedYear} />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="text-center border-slate-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#94C6EF]">{stats.total}</div>
                <div className="text-sm text-slate-600 font-medium">Total Visitantes</div>
              </CardContent>
            </Card>
            <Card className="text-center border-slate-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#A8D0F2]">{stats.new}</div>
                <div className="text-sm text-slate-600 font-medium">Novos Visitantes</div>
              </CardContent>
            </Card>
            <Card className="text-center border-slate-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#BCDAF5]">{stats.recurring}</div>
                <div className="text-sm text-slate-600 font-medium">Recorrentes</div>
              </CardContent>
            </Card>
            <Card className="text-center border-slate-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#CFE4F8]">{stats.avgDistance}km</div>
                <div className="text-sm text-slate-600 font-medium">Distância Média</div>
              </CardContent>
            </Card>
            <Card className="text-center border-slate-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#E2EEFB]">{cells.length}</div>
                <div className="text-sm text-slate-600 font-medium">Células Ativas</div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <Card className="overflow-hidden border-slate-200">
            <CardContent className="p-0">
              <div ref={mapContainer} className="w-full h-[600px]" />
            </CardContent>
          </Card>

          {/* Legend and Instructions */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#94C6EF]" />
                <span>Como interpretar o mapa</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-slate-800">Elementos do Mapa:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#94C6EF] rounded-full"></div>
                      <span className="text-slate-700"><strong>⛪ Azul grande:</strong> Localização da igreja</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#BCDAF5] rounded-full"></div>
                      <span className="text-slate-700"><strong>🏠 Azul médio:</strong> Células (grupos de casa)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#A8D0F2] rounded-full"></div>
                      <span className="text-slate-700"><strong>Pontos azul claro:</strong> Novos visitantes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#E2EEFB] rounded-full"></div>
                      <span className="text-slate-700"><strong>Pontos azul suave:</strong> Visitantes recorrentes</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-8 h-0.5 bg-[#94C6EF] opacity-40"></div>
                      <span className="text-slate-700"><strong>Linhas:</strong> Conexão entre visitante e igreja</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-slate-800">Funcionalidades:</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Clique nos marcadores para ver detalhes completos</li>
                    <li>• Use os filtros para visualizar grupos específicos</li>
                    <li>• Alterne para a visão de tabela para análise hierárquica</li>
                    <li>• Na tabela, organize por cidades, bairros e células</li>
                    <li>• Direcione visitantes para células próximas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportMap;
