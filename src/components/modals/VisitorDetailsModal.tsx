
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  User, 
  ChevronDown,
  Home,
  Map,
  MapPinned,
  MessageSquare,
  UserPlus,
  BookMarked,
  FileText
} from 'lucide-react';

interface Visitor {
  id: number;
  name: string;
  gender: string;
  email: string;
  phone: string;
  cep: string;
  neighborhood: string;
  city: string;
  ageGroup: string;
  generation: string;
  howDidYouHear: string;
  inviterName: string;
  consolidatorName: string;
  notes: string;
  visitDate: string;
  firstTime: boolean;
  status: string;
}

interface VisitorDetailsModalProps {
  visitor: Visitor | null;
  isOpen: boolean;
  onClose: () => void;
}

const VisitorDetailsModal: React.FC<VisitorDetailsModalProps> = ({
  visitor,
  isOpen,
  onClose
}) => {
  if (!visitor) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'contacted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'contacted':
        return 'Contatado';
      case 'pending':
        return 'Pendente';
      default:
        return 'Indefinido';
    }
  };

  // Função para formatar o texto de como conheceu
  const getHowDidYouHearText = (value: string) => {
    switch (value) {
      case 'instagram':
        return 'Instagram';
      case 'facebook':
        return 'Facebook';
      case 'amigo_fora':
        return 'Um amigo de fora da igreja';
      case 'amigo_igreja':
        return 'Um amigo que já frequenta a igreja';
      default:
        return value;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair text-slate-800">
            Detalhes do Visitante
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Cabeçalho com Avatar e Nome */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 border-b pb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] rounded-full flex items-center justify-center text-white font-bold text-3xl">
              {visitor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-2xl font-bold text-slate-800">{visitor.name}</h3>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                <Badge className="bg-slate-100 text-slate-700">
                  {visitor.gender === 'masculino' ? 'Homem' : 'Mulher'}
                </Badge>
                <Badge className="bg-blue-100 text-blue-700">
                  {visitor.ageGroup}
                </Badge>
                {visitor.generation && (
                  <Badge className="bg-purple-100 text-purple-700">
                    {visitor.generation}
                  </Badge>
                )}
                {visitor.firstTime && (
                  <Badge className="bg-green-100 text-green-700">
                    Primeira Visita
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coluna 1: Informações Pessoais */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <User className="w-5 h-5 text-[#94C6EF]" />
                Informações Pessoais
              </h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">Nome Completo</p>
                  <p className="text-slate-800">{visitor.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Gênero</p>
                    <p className="text-slate-800 capitalize">{visitor.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Idade</p>
                    <p className="text-slate-800 capitalize">{visitor.ageGroup}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-slate-500">Geração</p>
                  <p className="text-slate-800">{visitor.generation || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* Coluna 2: Contato */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#94C6EF]" />
                Contato
              </h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">Telefone</p>
                  <p className="text-slate-800">{visitor.phone}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-slate-500">Email</p>
                  <p className="text-slate-800">{visitor.email || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* Coluna 3: Endereço */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#94C6EF]" />
                Endereço
              </h4>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">CEP</p>
                    <p className="text-slate-800">{visitor.cep || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Bairro</p>
                    <p className="text-slate-800">{visitor.neighborhood || 'Não informado'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-slate-500">Cidade/UF</p>
                  <p className="text-slate-800">{visitor.city || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* Coluna 4: Informações Adicionais */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#94C6EF]" />
                Informações Adicionais
              </h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">Como conheceu a igreja?</p>
                  <p className="text-slate-800">
                    {visitor.howDidYouHear ? getHowDidYouHearText(visitor.howDidYouHear) : 'Não informado'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-slate-500">Quem convidou?</p>
                  <p className="text-slate-800">{visitor.inviterName || 'Não informado'}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-slate-500">Consolidador responsável</p>
                  <p className="text-slate-800">{visitor.consolidatorName || 'Não informado'}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-slate-500">Data da Visita</p>
                  <p className="text-slate-800">
                    {visitor.visitDate ? new Date(visitor.visitDate).toLocaleDateString('pt-BR') : 'Não informada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          {visitor.notes && (
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#94C6EF]" />
                Observações
              </h4>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-800 whitespace-pre-line">{visitor.notes}</p>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Status:</span>
              <Badge className={getStatusColor(visitor.status)}>
                {getStatusText(visitor.status)}
              </Badge>
            </div>
            
            <div className="text-sm text-slate-500">
              ID: {visitor.id}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VisitorDetailsModal;
