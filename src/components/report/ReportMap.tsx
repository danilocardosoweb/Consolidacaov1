import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MapPin, Users, Navigation, Filter, Eye, Home, Church, Map, Table, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReportMapTable from './ReportMapTable';
import { Visitor } from '@/types/visitor';
import { Cell } from '@/types/cell';
import { ReportMapTableProps } from './ReportMapTable';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare module 'leaflet' {
  namespace L {
    export function heatLayer(latlngs: [number, number, number][], options?: { radius: number }): HeatmapLayer;
  }
}

interface ReportMapProps {
  selectedMonth: number;
  selectedYear: number;
}

interface HeatmapLayer extends L.Layer {
  setLatLngs(latlngs: [number, number, number][]): void;
  setOptions(options: { radius: number }): void;
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
  const markerLayer = useRef<L.FeatureGroup | null>(null);
  const heatmapLayer = useRef<HeatmapLayer | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'new' | 'recurring'>('all');
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [mapViewType, setMapViewType] = useState<'markers' | 'heatmap'>('markers');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChurch, setShowChurch] = useState(true);
  const [showVisitors, setShowVisitors] = useState(true);
  const [showCells, setShowCells] = useState(true);
  const [activeGenerations, setActiveGenerations] = useState<string[]>(GENERATIONS.map(g => g.value));

  const churchLocation = {
    lat: -23.5505,
    lng: -46.6333,
    name: "Nossa Igreja"
  };

  const filteredVisitors = visitors.filter(visitor => {
    if (selectedFilter === 'new') return visitor.is_new_visitor;
    if (selectedFilter === 'recurring') return !visitor.is_new_visitor;
    return true;
  });

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
      if (markerLayer.current) {
        markerLayer.current.clearLayers();
        markerLayer.current = null;
      }
      if (heatmapLayer.current) {
        heatmapLayer.current.remove();
        heatmapLayer.current = null;
      }
    };
  }, [loading, selectedFilter, viewMode]);

  useEffect(() => {
    if (!map.current) return;

    if (mapViewType === 'markers') {
      markerLayer.current = new L.FeatureGroup().addTo(map.current);
      if (showChurch) {
        const churchIcon = L.divIcon({
          html: `<div style="width: 24px; height: 24px; background: #94C6EF; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><div style="color: white; font-size: 14px; font-weight: bold;">⛪</div></div>` ,
          className: 'custom-church-icon',
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });
        L.marker([churchLocation.lat, churchLocation.lng], { icon: churchIcon })
          .addTo(markerLayer.current)
          .bindPopup(`<div style="font-family: Inter, sans-serif;"><h3 style="margin: 0 0 8px 0; color: #1e293b; font-weight: bold;">${churchLocation.name}</h3><p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">Centro da Comunidade</p></div>`);
      }

      if (showCells) {
        cells.forEach(cell => {
          const cellIcon = L.divIcon({
            html: `<div style="width: 20px; height: 20px; background: #BCDAF5; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.2);"><div style="color: #1e293b; font-size: 10px; font-weight: bold;">🏠</div></div>` ,
            className: 'custom-cell-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
          L.marker([cell.lat, cell.lng], { icon: cellIcon })
            .addTo(markerLayer.current!)
            .bindPopup(`<div style="font-family: Inter, sans-serif; max-width: 250px;"><h4 style="margin: 0 0 8px 0; color: #1e293b; font-weight: bold;">${cell.name}</h4><div style="margin-bottom: 6px;"><strong style="color: #475569;">Líder:</strong> ${cell.leader_name}</div></div>`);
        });
      }

      if (showVisitors) {
        filteredVisitors.forEach(visitor => {
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
            .addTo(markerLayer.current!)
            .bindPopup(`<div style="font-family: Inter, sans-serif; max-width: 220px;"><h4 style="margin: 0 0 8px 0; color: #1e293b; font-weight: bold;">${visitor.name}</h4><div style="margin-bottom: 6px; color: #475569;">${visitor.address}</div><div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span style="color: #64748b;">Geração:</span><span style="color: #1e293b; font-weight: bold;">${visitor.generation}</span></div></div>`);
        });
      }
      
      const markersToBounds = [];
      if (showChurch) markersToBounds.push(L.marker([churchLocation.lat, churchLocation.lng]));
      if (showCells) cells.forEach(cell => markersToBounds.push(L.marker([cell.lat, cell.lng])));
      if (showVisitors) filteredVisitors.forEach(visitor => {
        if (activeGenerations.includes(visitor.generation)) markersToBounds.push(L.marker([visitor.lat, visitor.lng]));
      });
      if (markersToBounds.length > 0) {
        const group = new L.FeatureGroup(markersToBounds);
        map.current.fitBounds(group.getBounds().pad(0.1));
      }

    } else if (mapViewType === 'heatmap') {
      const heatmapData: [number, number, number][] = filteredVisitors
        .filter(visitor => activeGenerations.includes(visitor.generation))
        .map(visitor => [visitor.lat, visitor.lng, 1]);

      if (heatmapData.length > 0) {
        heatmapLayer.current = L.heatLayer(heatmapData, { radius: 25 }).addTo(map.current);
        
        const latLngs = heatmapData.map(point => [point[0], point[1]] as [number, number]);
        const bounds = L.latLngBounds(latLngs);
        map.current.fitBounds(bounds.pad(0.1));
      }
    }

  }, [mapViewType, showChurch, showVisitors, showCells, activeGenerations, filteredVisitors, cells]);

  const initializeMap = () => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current).setView(
      [churchLocation.lat, churchLocation.lng],
      12
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.current);

    markerLayer.current = new L.FeatureGroup().addTo(map.current);
  };

  const fetchData = async () => {
    try {
      const { data: visitorsData, error: visitorsError } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (visitorsError) throw visitorsError;

      const { data: cellsData, error: cellsError } = await supabase
        .from('cells')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (cellsError) throw cellsError;

      const visitorsWithCoords: Visitor[] = (visitorsData || []).map((v: Record<string, unknown>) => ({
        id: typeof v.id === 'string' ? v.id : '',
        name: typeof v.name === 'string' ? v.name : '',
        lat: typeof v.lat === 'number' ? v.lat : churchLocation.lat,
        lng: typeof v.lng === 'number' ? v.lng : churchLocation.lng,
        address: typeof v.address === 'string' ? v.address : '',
        gender: typeof v.gender === 'string' ? v.gender : '',
        email: typeof v.email === 'string' ? v.email : '',
        phone: typeof v.phone === 'string' ? v.phone : '',
        cep: typeof v.cep === 'string' ? v.cep : '',
        neighborhood: typeof v.neighborhood === 'string' ? v.neighborhood : '',
        city: typeof v.city === 'string' ? v.city : '',
        ageGroup: typeof v.ageGroup === 'string' ? v.ageGroup : '',
        generation: typeof v.generation === 'string' ? v.generation : '',
        howDidYouHear: typeof v.howDidYouHear === 'string' ? v.howDidYouHear : '',
        inviterName: typeof v.inviterName === 'string' ? v.inviterName : '',
        consolidatorName: typeof v.consolidatorName === 'string' ? v.consolidatorName : '',
        notes: typeof v.notes === 'string' ? v.notes : '',
        visitDate: typeof v.visitDate === 'string' ? v.visitDate : '',
        firstTime: typeof v.firstTime === 'boolean' ? v.firstTime : false,
        is_new_visitor: typeof v.is_new_visitor === 'boolean' ? v.is_new_visitor : false,
        status: typeof v.status === 'string' ? (v.status as Visitor['status']) : 'pending',
        createdAt: typeof v.createdAt === 'string' ? v.createdAt : new Date().toISOString(),
        updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : new Date().toISOString(),
        distance: typeof v.distance === 'number' ? v.distance : 0,
      }));

      const cellsWithCoords: Cell[] = (cellsData || []).map((c: Record<string, unknown>) => ({
        id: typeof c.id === 'string' ? c.id : '',
        name: typeof c.name === 'string' ? c.name : '',
        leader_name: typeof c.leader_name === 'string' ? c.leader_name : '',
        leader_phone: typeof c.leader_phone === 'string' ? c.leader_phone : undefined,
        leader_email: typeof c.leader_email === 'string' ? c.leader_email : undefined,
        address: typeof c.address === 'string' ? c.address : '',
        cep: typeof c.cep === 'string' ? c.cep : undefined,
        city: typeof c.city === 'string' ? c.city : undefined,
        neighborhood: typeof c.neighborhood === 'string' ? c.neighborhood : undefined,
        generation: typeof c.generation === 'string' ? c.generation : undefined,
        lat: typeof c.lat === 'number' ? c.lat : churchLocation.lat,
        lng: typeof c.lng === 'number' ? c.lng : churchLocation.lng,
        meeting_day: typeof c.meeting_day === 'string' ? c.meeting_day : '',
        meeting_time: typeof c.meeting_time === 'string' ? c.meeting_time : '',
        capacity: typeof c.capacity === 'number' ? c.capacity : 0,
        current_members: typeof c.current_members === 'number' ? c.current_members : 0,
        is_active: typeof c.is_active === 'boolean' ? c.is_active : false,
        description: typeof c.description === 'string' ? c.description : undefined,
        created_at: typeof c.created_at === 'string' ? c.created_at : new Date().toISOString(),
        updated_at: typeof c.updated_at === 'string' ? c.updated_at : new Date().toISOString(),
      }));

      setVisitors(visitorsWithCoords);
      setCells(cellsWithCoords);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      toast.error('Erro ao carregar dados do mapa');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: filteredVisitors.length,
    new: filteredVisitors.filter(v => v.is_new_visitor).length,
    recurring: filteredVisitors.filter(v => !v.is_new_visitor).length,
    avgDistance: filteredVisitors.length > 0
      ? (filteredVisitors.reduce((sum, v) => sum + (v.distance || 0), 0) / filteredVisitors.length).toFixed(1)
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
      <div className="text-center">
        <h2 className="text-3xl font-playfair font-bold text-slate-800 mb-2">
          Mapa de Visitantes e Células
        </h2>
        <p className="text-slate-600 font-medium">
          Visualização da distribuição geográfica da comunidade
        </p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
          </div>

          {viewMode === 'map' && (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-semibold text-slate-700">Mapa:</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setMapViewType('markers')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all font-medium ${
                      mapViewType === 'markers'
                        ? 'bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Marcadores</span>
                  </button>
                  <button
                    onClick={() => setMapViewType('heatmap')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all font-medium ${
                      mapViewType === 'heatmap'
                        ? 'bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span>Heatmap</span>
                  </button>
                </div>
              </div>

              {mapViewType === 'markers' && (
                 <div className="flex items-start space-x-4 mt-4 md:mt-0">
                   <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-semibold text-slate-700">Filtrar Exibição:</span>
                   </div>
                   <div className="flex space-x-2 flex-wrap">
                    <label className="flex items-center text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showChurch}
                        onChange={(e) => setShowChurch(e.target.checked)}
                        className="mr-1 text-[#94C6EF] rounded focus:ring-[#94C6EF]"
                      />
                      Igreja
                    </label>
                     <label className="flex items-center text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showVisitors}
                        onChange={(e) => setShowVisitors(e.target.checked)}
                        className="mr-1 text-[#94C6EF] rounded focus:ring-[#94C6EF]"
                      />
                      Visitantes
                    </label>
                     <label className="flex items-center text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCells}
                        onChange={(e) => setShowCells(e.target.checked)}
                        className="mr-1 text-[#94C6EF] rounded focus:ring-[#94C6EF]"
                      />
                      Células
                    </label>
                  </div>
                 </div>
              )}

              {mapViewType === 'heatmap' && (
                <div className="flex items-start space-x-4 mt-4 md:mt-0">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-semibold text-slate-700">Gerações (Heatmap):</span>
                    </div>
                    <div className="flex space-x-4 ml-6">
                      <button onClick={() => setActiveGenerations(GENERATIONS.map(g => g.value))} className="text-sm text-[#94C6EF] hover:underline">Selecionar Todas</button>
                      <button onClick={() => setActiveGenerations([])} className="text-sm text-slate-600 hover:underline">Limpar Seleção</button>
                    </div>
                  </div>
                   <div className="flex flex-wrap gap-2 flex-1">
                     {GENERATIONS.map(gen => (
                        <label key={gen.value} className="flex items-center text-sm text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeGenerations.includes(gen.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setActiveGenerations([...activeGenerations, gen.value]);
                              } else {
                                setActiveGenerations(activeGenerations.filter(g => g !== gen.value));
                              }
                            }}
                            className="mr-1 text-[#94C6EF] rounded focus:ring-[#94C6EF]"
                          />
                          {gen.value}
                        </label>
                      ))}
                    </div>
                 </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {viewMode === 'map' ? (
        <div id="mapid" ref={mapContainer} className="w-full" style={{ height: '600px' }}></div>
      ) : (
        <ReportMapTable visitors={filteredVisitors} cells={cells} churchLocation={churchLocation} selectedMonth={selectedMonth} selectedYear={selectedYear} />
      )}

      {viewMode === 'map' && mapViewType === 'heatmap' && (
        <div className="text-center text-sm text-slate-600 font-medium mt-4">
          O Heatmap mostra a densidade de visitantes por área. Áreas mais quentes (vermelhas) indicam maior concentração.
        </div>
      )}

      {viewMode === 'table' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#94C6EF] mb-1">{stats.total}</div>
              <div className="text-sm text-slate-600">Visitantes Encontrados</div>
            </CardContent>
          </Card>
           <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.new}</div>
              <div className="text-sm text-slate-600">Novos Visitantes (Filtro)</div>
            </CardContent>
          </Card>
           <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">{stats.recurring}</div>
              <div className="text-sm text-slate-600">Visitantes Recorrentes (Filtro)</div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};

export default ReportMap;
