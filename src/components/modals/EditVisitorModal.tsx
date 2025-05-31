import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { useToast } from '../ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { User, MapPin, FileText, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Visitor {
  id: string;
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

const ageGroups = [
  { value: 'adolescente', label: 'Adolescente' },
  { value: 'jovem', label: 'Jovem' },
  { value: 'adulto', label: 'Adulto' },
];

const generations = [
  { value: 'Atos', label: 'Atos' },
  { value: 'Efraim', label: 'Efraim' },
  { value: 'Israel', label: 'Israel' },
  { value: 'José', label: 'José' },
  { value: 'Josué', label: 'Josué' },
  { value: 'Kairó', label: 'Kairó' },
  { value: 'Levi', label: 'Levi' },
  { value: 'Moriah', label: 'Moriah' },
  { value: 'Rafah', label: 'Rafah' },
  { value: 'Samuel', label: 'Samuel' },
  { value: 'Zion', label: 'Zion' },
  { value: 'Zoe', label: 'Zoe' },
];

const howDidYouHearOptions = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'amigo_fora', label: 'Um amigo de fora da igreja' },
  { value: 'amigo_igreja', label: 'Um amigo que já frequenta a igreja' },
];

interface EditVisitorModalProps {
  visitor: Visitor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedVisitor: Omit<Visitor, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const EditVisitorModal: React.FC<EditVisitorModalProps> = ({
  visitor,
  isOpen,
  onClose,
  onSave
}) => {
  const defaultFormData: Omit<Visitor, 'id' | 'createdAt' | 'updatedAt'> = {
    name: '',
    gender: '',
    email: '',
    phone: '',
    cep: '',
    neighborhood: '',
    city: '',
    ageGroup: '',
    generation: '',
    howDidYouHear: '',
    inviterName: '',
    consolidatorName: '',
    notes: '',
    visitDate: new Date().toISOString().split('T')[0],
    firstTime: false,
    status: 'pending'
  };

  const [formData, setFormData] = useState<Omit<Visitor, 'id' | 'createdAt' | 'updatedAt'>>(defaultFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    if (visitor) {
      setFormData({
        ...defaultFormData,
        ...visitor,
        visitDate: visitor.visitDate.split('T')[0]
      });
    }
  }, [visitor]);

  if (!visitor) return null;

  const handleInputChange = (field: keyof Visitor, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não for dígito
    value = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d*)/, '($1');
    }
    
    return value;
  };

  const formatCep = (value: string) => {
    // Remove tudo que não for dígito
    value = value.replace(/\D/g, '');
    
    // Aplica a máscara 00000-000
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{0,3}).*/, '$1-$2');
    }
    
    return value;
  };

  const handleCepBlur = async () => {
    if (!formData.cep || formData.cep.replace(/\D/g, '').length !== 8) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`https://viacep.com.br/ws/${formData.cep.replace(/\D/g, '')}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          neighborhood: data.bairro || '',
          city: `${data.localidade || ''}${data.uf ? `/${data.uf}` : ''}`
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Não foi possível buscar o endereço. Verifique o CEP e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }
    if (!formData.gender) {
      toast.error('Gênero é obrigatório');
      return false;
    }
    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      toast.error('Telefone inválido');
      return false;
    }
    if (!formData.ageGroup) {
      toast.error('Faixa etária é obrigatória');
      return false;
    }
    if (formData.cep && formData.cep.replace(/\D/g, '').length !== 8) {
      toast.error('CEP inválido');
      return false;
    }
    if (!formData.consolidatorName?.trim()) {
      toast.error('Consolidador responsável é obrigatório');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onSave(formData);
    toast.success('Visitante atualizado com sucesso!');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair text-slate-800 flex items-center gap-2">
            <User className="w-6 h-6" />
            Editar Visitante
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Dados Pessoais</span>
            </TabsTrigger>
            <TabsTrigger value="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Endereço</span>
            </TabsTrigger>
            <TabsTrigger value="additional" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Adicionais</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium text-slate-700">
                  Gênero *
                </Label>
                <Select 
                  value={formData.gender || ''} 
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                  Telefone *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageGroup" className="text-sm font-medium text-slate-700">
                  Faixa Etária *
                </Label>
                <Select 
                  value={formData.ageGroup || ''} 
                  onValueChange={(value) => handleInputChange('ageGroup', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a faixa etária" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageGroups.map(group => (
                      <SelectItem key={group.value} value={group.value}>
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="generation" className="text-sm font-medium text-slate-700">
                  Geração do Amigo
                </Label>
                <Select 
                  value={formData.generation || ''} 
                  onValueChange={(value) => handleInputChange('generation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a geração" />
                  </SelectTrigger>
                  <SelectContent>
                    {generations.map(gen => (
                      <SelectItem key={gen.value} value={gen.value}>
                        {gen.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="address" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cep" className="text-sm font-medium text-slate-700">
                  CEP
                </Label>
                <div className="relative">
                  <Input
                    id="cep"
                    value={formData.cep || ''}
                    onChange={(e) => handleInputChange('cep', formatCep(e.target.value))}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    className="pr-10"
                  />
                  {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood" className="text-sm font-medium text-slate-700">
                  Bairro
                </Label>
                <Input
                  id="neighborhood"
                  value={formData.neighborhood || ''}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  placeholder="Nome do bairro"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="city" className="text-sm font-medium text-slate-700">
                  Cidade/UF
                </Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Cidade/UF"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="additional" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="howDidYouHear" className="text-sm font-medium text-slate-700">
                  Como conheceu a igreja?
                </Label>
                <Select 
                  value={formData.howDidYouHear || ''} 
                  onValueChange={(value) => handleInputChange('howDidYouHear', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione como conheceu" />
                  </SelectTrigger>
                  <SelectContent>
                    {howDidYouHearOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviterName" className="text-sm font-medium text-slate-700">
                  Quem convidou?
                </Label>
                <Input
                  id="inviterName"
                  value={formData.inviterName || ''}
                  onChange={(e) => handleInputChange('inviterName', e.target.value)}
                  placeholder="Nome de quem convidou"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consolidatorName" className="text-sm font-medium text-slate-700">
                  Consolidador responsável *
                </Label>
                <Input
                  id="consolidatorName"
                  value={formData.consolidatorName || ''}
                  onChange={(e) => handleInputChange('consolidatorName', e.target.value)}
                  placeholder="Nome do consolidador"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitDate" className="text-sm font-medium text-slate-700">
                  Data da Visita
                </Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={formData.visitDate || ''}
                  onChange={(e) => handleInputChange('visitDate', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="status" className="text-sm font-medium text-slate-700">
                  Status
                </Label>
                <Select 
                  value={formData.status || 'pending'} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="contacted">Contatado</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="firstTime"
                  checked={formData.firstTime || false}
                  onChange={(e) => handleInputChange('firstTime', e.target.checked)}
                  className="rounded border-gray-300 text-[#94C6EF] focus:ring-[#94C6EF]"
                />
                <Label htmlFor="firstTime" className="text-sm text-slate-700">
                  Primeira visita
                </Label>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
                  Observações
                </Label>
                <textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Anotações adicionais sobre o visitante"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto bg-gradient-to-r from-[#94C6EF] to-[#A8D0F2] text-white hover:opacity-90"
          >
            <Check className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditVisitorModal;
