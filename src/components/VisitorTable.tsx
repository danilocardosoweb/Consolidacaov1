import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, Mail, Phone, MapPin, Users, ArrowLeft, Search, Filter, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import VisitorDetailsModal from './modals/VisitorDetailsModal';
import EditVisitorModal from './modals/EditVisitorModal';
import DeleteVisitorModal from './modals/DeleteVisitorModal';
import { Visitor } from '@/types/visitor';
import { supabase } from '@/integrations/supabase/client';

interface VisitorTableProps {
  onNavigate: (view: string) => void;
}

const VisitorTable: React.FC<VisitorTableProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Estados para os modais
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisitors = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('visitors')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        setVisitors([]);
      } else {
        setVisitors(
          (data || []).map((v: Record<string, any>) => ({
            id: v.id,
            name: v.name,
            gender: v.metadata?.gender || '',
            email: v.metadata?.email || '',
            phone: v.metadata?.phone || '',
            cep: v.metadata?.cep || '',
            neighborhood: v.address?.split(',')[0] || '',
            city: v.address?.split(',')[1]?.trim() || '',
            ageGroup: v.metadata?.ageGroup || '',
            generation: v.metadata?.generation || '',
            howDidYouHear: v.metadata?.howDidYouHear || '',
            inviterName: v.metadata?.inviterName || '',
            consolidatorName: v.metadata?.consolidatorName || '',
            notes: v.metadata?.notes || '',
            visitDate: v.created_at,
            firstTime: v.is_new_visitor,
            status: (v.status as Visitor['status']) || 'pending',
            createdAt: v.created_at,
            updatedAt: v.updated_at
          }))
        );
      }
      setLoading(false);
    };
    fetchVisitors();
  }, []);

  // Funções para os modais
  const handleViewDetails = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setIsDetailsModalOpen(true);
  };

  const handleEditVisitor = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setIsEditModalOpen(true);
  };

  const handleDeleteVisitor = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setIsDeleteModalOpen(true);
  };

  const handleSaveVisitor = (updatedVisitor: Visitor) => {
    setVisitors(prev => 
      prev.map(visitor => 
        visitor.id === updatedVisitor.id ? updatedVisitor : visitor
      )
    );
  };

  const handleConfirmDelete = async (visitorId: string) => {
    // Remove do banco de dados
    const { error } = await supabase.from('visitors').delete().eq('id', visitorId);
    if (!error) {
      setVisitors(prev => prev.filter(visitor => visitor.id !== visitorId));
    } else {
      // Exibe erro se necessário
      alert('Erro ao excluir visitante: ' + error.message);
    }
  };

  const filteredVisitors = visitors.filter(visitor =>
    visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.phone.includes(searchTerm) ||
    (visitor.generation && visitor.generation.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (visitor.neighborhood && visitor.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'converted':
        return 'bg-purple-100 text-purple-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_interested':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'converted':
        return 'Convertido';
      case 'contacted':
        return 'Contatado';
      case 'pending':
        return 'Pendente';
      case 'not_interested':
        return 'Não interessado';
      default:
        return status;
    }
  };

  const getGenderText = (gender: string) => {
    switch (gender) {
      case 'male':
        return 'Masculino';
      case 'female':
        return 'Feminino';
      case 'other':
        return 'Outro';
      default:
        return gender;
    }
  };

  const getAgeGroupText = (ageGroup: string) => {
    switch (ageGroup) {
      case 'adolescente':
        return 'Adolescente';
      case 'jovem':
        return 'Jovem';
      case 'adulto':
        return 'Adulto';
      default:
        return ageGroup;
    }
  };

  // Detect mobile screen size
  React.useEffect(() => {
    const checkScreenSize = () => {
      setViewMode(window.innerWidth < 768 ? 'cards' : 'table');
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <button
                onClick={() => onNavigate('dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-playfair font-bold text-slate-800 truncate">
                  Lista de Visitantes
                </h1>
                <p className="text-sm sm:text-base text-slate-600 font-medium hidden sm:block">
                  Gerencie todos os visitantes da igreja
                </p>
              </div>
            </div>
            
            {/* Desktop Search and Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar visitantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 border-slate-300 focus:border-[#94C6EF]"
                />
              </div>
              <Button
                onClick={() => onNavigate('form')}
                className="bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white hover:opacity-90"
              >
                Novo Visitante
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <Button
                onClick={() => onNavigate('form')}
                size="sm"
                className="bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white hover:opacity-90"
              >
                Novo
              </Button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar visitantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 border-slate-300 focus:border-[#94C6EF]"
              />
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t space-y-2 animate-fade-in">
              <button
                onClick={() => {
                  setViewMode(viewMode === 'table' ? 'cards' : 'table');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Filter className="w-5 h-5 text-[#94C6EF]" />
                <span>Alternar visualização</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#94C6EF] mb-1">{filteredVisitors.length}</div>
              <div className="text-sm text-slate-600">Total</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {filteredVisitors.filter(v => v.firstTime).length}
              </div>
              <div className="text-sm text-slate-600">Novos</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {filteredVisitors.filter(v => v.status === 'active').length}
              </div>
              <div className="text-sm text-slate-600">Ativos</div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {filteredVisitors.filter(v => v.status === 'pending').length}
              </div>
              <div className="text-sm text-slate-600">Pendentes</div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {viewMode === 'cards' ? (
          // Mobile Card View
          <div className="space-y-4">
            {filteredVisitors.map((visitor) => (
              <Card key={visitor.id} className="border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {visitor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-800 truncate">{visitor.name}</h3>
                        {visitor.firstTime && (
                          <span className="text-xs text-[#94C6EF] font-medium">Primeira visita</span>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visitor.status)}`}>
                      {getStatusText(visitor.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{visitor.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{visitor.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>{visitor.city}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {new Date(visitor.visitDate).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewDetails(visitor)}
                        className="text-[#94C6EF] hover:text-[#A8D0F2] p-2 rounded-lg hover:bg-[#94C6EF]/10 transition-colors"
                        title="Visualizar detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditVisitor(visitor)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Editar visitante"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteVisitor(visitor)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Excluir visitante"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop Table View
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gênero
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Idade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Geração
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data da Visita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] rounded-full flex items-center justify-center text-white font-semibold">
                            {visitor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{visitor.name}</div>
                            {visitor.firstTime && (
                              <div className="text-xs text-[#94C6EF] font-medium">Primeira visita</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            {visitor.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            {visitor.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getGenderText(visitor.gender)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {getAgeGroupText(visitor.ageGroup)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {visitor.generation || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <div>
                            <div>{visitor.neighborhood || 'Bairro não informado'}</div>
                            <div className="text-xs text-gray-500">{visitor.city}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>{new Date(visitor.visitDate).toLocaleDateString('pt-BR')}</div>
                        <div className="text-xs text-gray-500">
                          {visitor.firstTime ? 'Primeira visita' : 'Retorno'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(visitor.status)}`}>
                          {getStatusText(visitor.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewDetails(visitor)}
                            className="text-[#94C6EF] hover:text-[#A8D0F2] p-1 rounded-lg hover:bg-[#94C6EF]/10 transition-colors"
                            title="Visualizar detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditVisitor(visitor)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Editar visitante"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteVisitor(visitor)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors"
                            title="Excluir visitante"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredVisitors.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">
                  <Users className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">Nenhum visitante encontrado</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400 mt-1">
                    Tente ajustar sua busca ou adicionar novos visitantes
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <VisitorDetailsModal
        visitor={selectedVisitor}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      <EditVisitorModal
        visitor={selectedVisitor}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveVisitor}
      />

      <DeleteVisitorModal
        visitor={selectedVisitor}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default VisitorTable;
