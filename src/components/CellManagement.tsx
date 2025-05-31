import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Plus, Edit, Trash2, Users, Clock, MapPin, Phone, Mail, List, Grid, X } from 'lucide-react';
import CellCardCompact from './CellCardCompact';
import { toast } from 'sonner';
import Modal from './ui/modal';
import ConfirmationDialog from './ui/confirmation-dialog';

interface Cell {
  id: string;
  name: string;
  leader_name: string;
  leader_phone?: string;
  leader_email?: string;
  address: string;
  cep?: string;
  city?: string;
  neighborhood?: string;
  generation?: string;
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

interface FormData {
  name: string;
  leader_name: string;
  leader_phone: string;
  leader_email: string;
  address: string;
  cep: string;
  city: string;
  neighborhood: string;
  generation: string;
  lat: number;
  lng: number;
  meeting_day: string;
  meeting_time: string;
  capacity: number;
  description: string;
}

const CellManagement: React.FC<CellManagementProps> = ({ onNavigate }) => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCell, setEditingCell] = useState<Cell | null>(null);
  const [loading, setLoading] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cellToDelete, setCellToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    leader_name: '',
    leader_phone: '',
    leader_email: '',
    address: '',
    cep: '',
    city: '',
    neighborhood: '',
    generation: '',
    lat: 0,
    lng: 0,
    meeting_day: '',
    meeting_time: '',
    capacity: 15,
    description: ''
  });

  const weekDays = [
    'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira',
    'Sexta-feira', 'Sábado', 'Domingo'
  ];

  useEffect(() => {
    fetchCells();
  }, []);

  const fetchCells = async () => {
    try {
      const { data, error } = await supabase
        .from('cells')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Garante que os novos campos tenham valores padrão
      const cellsWithDefaults = (data || []).map((cell: any) => ({
        ...cell,
        cep: cell.cep || '',
        city: cell.city || '',
        neighborhood: cell.neighborhood || ''
      })) as Cell[];
      
      setCells(cellsWithDefaults);
    } catch (error) {
      console.error('Erro ao buscar células:', error);
      toast.error('Erro ao carregar células');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const cellData = {
        ...formData,
        updated_at: new Date().toISOString()
      };
      
      if (editingCell) {
        // Atualizar célula existente
        const { error } = await supabase
          .from('cells')
          .update(cellData)
          .eq('id', editingCell.id);
          
        if (error) throw error;
        
        toast.success('Célula atualizada com sucesso!');
      } else {
        // Criar nova célula
        const { error } = await supabase
          .from('cells')
          .insert([{
            ...cellData,
            current_members: 0,
            is_active: true,
            created_at: new Date().toISOString()
          }]);
          
        if (error) throw error;
        
        toast.success('Célula cadastrada com sucesso!');
      }
      
      setShowForm(false);
      fetchCells();
      resetForm();
    } catch (error) {
      console.error('Error saving cell:', error);
      toast.error('Erro ao salvar célula');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cell: Cell) => {
    setEditingCell(cell);
    setFormData({
      name: cell.name,
      leader_name: cell.leader_name,
      leader_phone: cell.leader_phone || '',
      leader_email: cell.leader_email || '',
      address: cell.address,
      cep: cell.cep || '',
      city: cell.city || '',
      neighborhood: cell.neighborhood || '',
      generation: cell.generation || '',
      lat: cell.lat,
      lng: cell.lng,
      meeting_day: cell.meeting_day,
      meeting_time: cell.meeting_time,
      capacity: cell.capacity,
      description: cell.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setCellToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async (confirmed: boolean) => {
    setShowDeleteConfirm(false);
    
    if (confirmed && cellToDelete) {
      try {
        const { error } = await supabase
          .from('cells')
          .delete()
          .eq('id', cellToDelete);

        if (error) throw error;

        toast.success('Célula excluída com sucesso!');
        fetchCells();
      } catch (error) {
        console.error('Error deleting cell:', error);
        toast.error('Erro ao excluir célula');
      } finally {
        setCellToDelete(null);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      leader_name: '',
      leader_phone: '',
      leader_email: '',
      address: '',
      cep: '',
      city: '',
      neighborhood: '',
      generation: '',
      lat: 0,
      lng: 0,
      meeting_day: '',
      meeting_time: '',
      capacity: 15,
      description: ''
    });
    setEditingCell(null);
    setShowForm(false);
  };

  const buscarCep = async (cep: string) => {
    try {
      // Remove caracteres não numéricos
      cep = cep.replace(/\D/g, '');
      
      // Verifica se o CEP tem 8 dígitos
      if (cep.length !== 8) return;
      
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }
      
      // Atualiza os campos do formulário com os dados do CEP
      setFormData(prev => ({
        ...prev,
        address: `${data.logradouro}, ${data.bairro}`,
        city: data.localidade,
        neighborhood: data.bairro,
        cep: cep
      }));
      
      // Busca as coordenadas geográficas
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(data.logradouro + ', ' + data.bairro + ', ' + data.localidade + ', ' + data.uf)}&format=json&limit=1`
      );
      const geoData = await geoResponse.json();
      
      if (geoData && geoData.length > 0) {
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(geoData[0].lat),
          lng: parseFloat(geoData[0].lon)
        }));
      }
      
      toast.success('Endereço preenchido automaticamente!');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar endereço');
    }
  };
  
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Formata o CEP (00000-000)
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.substring(0, 5) + '-' + value.substring(5, 8);
    }
    
    setFormData(prev => ({
      ...prev,
      cep: value
    }));
    
    // Busca o endereço quando o CEP estiver completo
    if (value.length === 9) {
      buscarCep(value);
    }
  };
  
  const geocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        }));
        toast.success('Coordenadas encontradas!');
      } else {
        toast.error('Endereço não encontrado');
      }
    } catch (error) {
      console.error('Erro ao geocodificar:', error);
      toast.error('Erro ao buscar coordenadas');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600">Carregando células...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Cabeçalho fixo com botão de voltar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('dashboard')}
              className="text-slate-600 hover:bg-slate-100"
              title="Voltar para o Dashboard"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-playfair font-bold text-slate-800">Gerenciar Células</h1>
              <p className="text-slate-600 font-medium text-sm md:text-base">Cadastre e gerencie os grupos de casa da igreja</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white hover:opacity-90 px-5 py-2 text-base font-semibold shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" /> Nova Célula
          </Button>
        </div>
      </div>

      {/* 2. Busca, Filtros e Visualização */}
      <div className="container mx-auto px-4 mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Buscar por nome, líder ou bairro..."
            className="w-full max-w-xs border-slate-300 focus:border-[#94C6EF]"
            // Adicione lógica de busca se desejar
          />
          {/* Filtros rápidos (exemplo) */}
          <select className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:border-[#94C6EF]">
            <option value="">Todas</option>
            <option value="ativas">Ativas</option>
            <option value="inativas">Inativas</option>
          </select>
        </div>
        
        {/* Botão de alternar visualização */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 hidden sm:inline">Visualização:</span>
          <div className="flex bg-white rounded-lg border border-slate-200 p-1">
            <button
              onClick={() => setCompactView(false)}
              className={`p-2 rounded ${!compactView ? 'bg-[#94C6EF]/20 text-[#94C6EF]' : 'text-slate-500 hover:bg-slate-50'}`}
              title="Visualização padrão"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCompactView(true)}
              className={`p-2 rounded ${compactView ? 'bg-[#94C6EF]/20 text-[#94C6EF]' : 'text-slate-500 hover:bg-slate-50'}`}
              title="Visualização compacta"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Grid Responsivo de Cards */}
      <div className="container mx-auto px-4 mt-8">
        {cells.length === 0 ? (
          // 6. Empty State ilustrativo
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
              <Card key={cell.id} className="relative group hover:shadow-xl transition-shadow border-2 border-transparent hover:border-[#94C6EF]/40 bg-white/90">
                {/* Ícone/avatar do líder */}
                <div className="absolute -top-6 left-6 bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <span className="text-white text-xl font-bold">
                    {cell.leader_name ? cell.leader_name.split(' ').map(n => n[0]).join('').slice(0, 2) : <Users className="w-6 h-6" />}
                  </span>
                </div>
                <CardHeader className="pb-2 pt-8">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                      {cell.name}
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full font-semibold ${cell.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{cell.is_active ? 'Ativa' : 'Inativa'}</span>
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
                    {cell.leader_phone && (
                      <>
                        <Phone className="w-4 h-4 text-[#94C6EF] ml-2" />
                        <span>{cell.leader_phone}</span>
                      </>
                    )}
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

      {/* Modal de Cadastro/Edição */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingCell ? 'Editar Célula' : 'Nova Célula'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nome da Célula *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="border-slate-300 focus:border-[#94C6EF] w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Líder *</label>
                    <Input
                      value={formData.leader_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, leader_name: e.target.value }))}
                      required
                      className="border-slate-300 focus:border-[#94C6EF] w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone do Líder</label>
                    <Input
                      value={formData.leader_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, leader_phone: e.target.value }))}
                      placeholder="(00) 00000-0000"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail do Líder</label>
                    <Input
                      type="email"
                      value={formData.leader_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, leader_email: e.target.value }))}
                      placeholder="email@exemplo.com"
                      className="w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">CEP *</label>
                    <div className="flex gap-2 w-full">
                      <Input
                        value={formData.cep}
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        maxLength={9}
                        className="w-40"
                        required
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => formData.cep && buscarCep(formData.cep)}
                        className="text-[#94C6EF] hover:bg-[#94C6EF]/10 whitespace-nowrap"
                      >
                        Buscar CEP
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Endereço *</label>
                    <div className="flex gap-2 w-full">
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Rua, número, complemento"
                        className="flex-1"
                        required
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => formData.address && geocodeAddress(formData.address)}
                        className="text-[#94C6EF] hover:bg-[#94C6EF]/10 whitespace-nowrap"
                        title="Buscar coordenadas"
                      >
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Bairro *</label>
                    <Input
                      value={formData.neighborhood}
                      onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
                      placeholder="Bairro"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Cidade/UF *</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Cidade/UF"
                      required
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Geração</label>
                    <select
                      value={formData.generation}
                      onChange={(e) => setFormData(prev => ({ ...prev, generation: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#94C6EF] focus:outline-none bg-white"
                    >
                      <option value="">Selecione uma geração</option>
                      <option value="Atos">Atos</option>
                      <option value="Efraim">Efraim</option>
                      <option value="Israel">Israel</option>
                      <option value="José">José</option>
                      <option value="Josué">Josué</option>
                      <option value="Kairó">Kairó</option>
                      <option value="Levi">Levi</option>
                      <option value="Moriah">Moriah</option>
                      <option value="Rafah">Rafah</option>
                      <option value="Samuel">Samuel</option>
                      <option value="Zion">Zion</option>
                      <option value="Zoe">Zoe</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Dia da Reunião *</label>
                    <select
                      value={formData.meeting_day}
                      onChange={(e) => setFormData(prev => ({ ...prev, meeting_day: e.target.value }))}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#94C6EF] focus:outline-none bg-white"
                    >
                      <option value="">Selecione...</option>
                      {weekDays.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Horário *</label>
                    <Input
                      type="time"
                      value={formData.meeting_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, meeting_time: e.target.value }))}
                      required
                      className="border-slate-300 focus:border-[#94C6EF]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Capacidade</label>
                    <Input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 15 }))}
                      min="1"
                      className="border-slate-300 focus:border-[#94C6EF]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Descrição</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="border-slate-300 focus:border-[#94C6EF]"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white hover:opacity-90 px-6 py-2 font-semibold"
                  >
                    {editingCell ? 'Atualizar' : 'Salvar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-2"
                  >
                    Cancelar
                  </Button>
                </div>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={confirmDelete}
        title="Excluir Célula"
        message="Tem certeza que deseja excluir esta célula? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default CellManagement;
