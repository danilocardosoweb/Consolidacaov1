import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Plus, Edit, Trash2, Users, Clock, MapPin, Phone, Mail, List, Grid } from 'lucide-react';
import CellCardCompact from './CellCardCompact';
import { toast } from 'sonner';

interface Cell {
  id: string;
  name: string;
  leader_name: string;
  leader_phone?: string;
  leader_email?: string;
  address: string;
  lat: number;
  lng: number;
  meeting_day: string;
  meeting_time: string;
  capacity: number;
  current_members: number;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface CellManagementProps {
  onNavigate: (view: string) => void;
}

const CellManagement: React.FC<CellManagementProps> = ({ onNavigate }) => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCell, setEditingCell] = useState<Cell | null>(null);
  const [loading, setLoading] = useState(true);
  const [compactView, setCompactView] = useState(false);
  
  // ... (outros estados e funções existentes)

  return (
    <div className="space-y-6">
      {/* Cabeçalho com botões de visualização */}
      <div className="container mx-auto px-4 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Gerenciamento de Células</h2>
          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setCompactView(false)}
              className={`p-2 rounded ${!compactView ? 'bg-white shadow' : 'text-slate-500'}`}
              title="Visualização em grade"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCompactView(true)}
              className={`p-2 rounded ${compactView ? 'bg-white shadow' : 'text-slate-500'}`}
              title="Visualização compacta"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="container mx-auto px-4">
        {cells.length === 0 ? (
          // Estado vazio
          <div className="flex flex-col items-center justify-center py-24">
            <Users className="w-20 h-20 text-[#94C6EF] mb-4 animate-bounce" />
            <h3 className="text-2xl font-semibold text-slate-600 mb-2">Nenhuma célula cadastrada</h3>
            <p className="text-slate-500 mb-6">Comece cadastrando a primeira célula da sua igreja</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white hover:opacity-90 px-6 py-2 text-lg font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" /> Cadastrar Primeira Célula
            </Button>
          </div>
        ) : compactView ? (
          // Visualização em Lista (Compacta)
          <div className="space-y-2">
            {cells.map((cell) => (
              <CellCardCompact 
                key={cell.id}
                cell={cell}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          // Visualização em Grid (Padrão)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cells.map((cell) => (
              <Card key={cell.id} className="relative group hover:shadow-xl transition-shadow border-2 border-transparent hover:border-[#94C6EF]/40 bg-white/90 h-full flex flex-col">
                {/* Conteúdo do card */}
                <div className="absolute -top-6 left-6 bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <span className="text-white text-xl font-bold">
                    {cell.leader_name ? cell.leader_name.split(' ').map(n => n[0]).join('').slice(0, 2) : <Users className="w-6 h-6" />}
                  </span>
                </div>
                <CardHeader className="pb-2 pt-8">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      {cell.name}
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full font-semibold ${cell.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {cell.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </CardTitle>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(cell)}
                        className="text-[#94C6EF] hover:bg-[#94C6EF]/10"
                        title="Editar célula"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(cell.id)}
                        className="text-red-500 hover:bg-red-50"
                        title="Excluir célula"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 mt-2 flex-grow flex flex-col">
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <Users className="w-4 h-4 text-[#94C6EF]" />
                    <span className="font-medium">{cell.leader_name}</span>
                    {cell.leader_phone && <><Phone className="w-4 h-4 text-[#94C6EF] ml-2" /><span>{cell.leader_phone}</span></>}
                  </div>
                  {cell.leader_email && (
                    <div className="flex items-center text-sm text-slate-600 gap-2">
                      <Mail className="w-4 h-4 text-[#94C6EF]" />
                      <span>{cell.leader_email}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <MapPin className="w-4 h-4 text-[#94C6EF]" />
                    <span>{cell.address}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 gap-2">
                    <Clock className="w-4 h-4 text-[#94C6EF]" />
                    <span>{cell.meeting_day} às {cell.meeting_time}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-2">
                    <span className="text-sm text-slate-600">{cell.current_members}/{cell.capacity} membros</span>
                  </div>
                  {cell.description && (
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{cell.description}</p>
                  )}
                  <div className="mt-auto pt-2">
                    <button 
                      onClick={() => handleEdit(cell)}
                      className="text-sm text-[#94C6EF] hover:underline"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CellManagement;
