import React, { useState } from 'react';
import { ArrowLeft, User, Phone, MapPin, ChevronDown, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VisitorFormProps {
  onNavigate: (view: string) => void;
}

interface FormData {
  name: string;
  gender: string;
  cep: string;
  neighborhood: string;
  city: string;
  ageGroup: string;
  generation: string;
  phone: string;
  howDidYouHear: string;
  inviterName: string;
  consolidatorName: string;
  notes: string;
}

const VisitorForm: React.FC<VisitorFormProps> = ({ onNavigate }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    gender: '',
    cep: '',
    neighborhood: '',
    city: '',
    ageGroup: '',
    generation: '',
    phone: '',
    howDidYouHear: '',
    inviterName: '',
    consolidatorName: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.name?.trim()) {
        toast({
          title: "Nome obrigatório",
          description: "Por favor, informe o nome do visitante.",
          variant: "destructive"
        });
        return false;
      }
      
      if (!formData.gender) {
        toast({
          title: "Gênero obrigatório",
          description: "Por favor, selecione o gênero do visitante.",
          variant: "destructive"
        });
        return false;
      }
      
      if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
        toast({
          title: "Telefone inválido",
          description: "Por favor, informe um número de telefone válido com DDD.",
          variant: "destructive"
        });
        return false;
      }
      
      if (!formData.ageGroup) {
        toast({
          title: "Faixa etária obrigatória",
          description: "Por favor, selecione a faixa etária do visitante.",
          variant: "destructive"
        });
        return false;
      }
    } else if (step === 2) {
      if (!formData.cep || formData.cep.replace(/\D/g, '').length !== 8) {
        toast({
          title: "CEP inválido",
          description: "Por favor, informe um CEP válido com 8 dígitos.",
          variant: "destructive"
        });
        return false;
      }
      
      if (!formData.neighborhood?.trim()) {
        toast({
          title: "Bairro obrigatório",
          description: "Por favor, informe o bairro do visitante.",
          variant: "destructive"
        });
        return false;
      }
      
      if (!formData.city?.trim()) {
        toast({
          title: "Cidade/UF obrigatória",
          description: "Por favor, informe a cidade e UF do visitante.",
          variant: "destructive"
        });
        return false;
      }
    } else if (step === 3) {
      if (!formData.consolidatorName) {
        toast({
          title: "Consolidador obrigatório",
          description: "Por favor, informe o nome do consolidador responsável.",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;

    // Confirmação antes de enviar
    const confirmSend = window.confirm('Tem certeza que deseja cadastrar este visitante?');
    if (!confirmSend) return;

    setIsSubmitting(true);

    try {
      // Inserir visitante no Supabase
      const { error } = await supabase.from('visitors').insert([
        {
          name: formData.name,
          address: `${formData.neighborhood}, ${formData.city}`,
          lat: 0, // valor padrão
          lng: 0, // valor padrão
          distance: 0, // valor padrão
          status: 'pending',
          visit_count: 1,
          is_new_visitor: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            gender: formData.gender,
            phone: formData.phone,
            cep: formData.cep,
            ageGroup: formData.ageGroup,
            generation: formData.generation,
            howDidYouHear: formData.howDidYouHear,
            inviterName: formData.inviterName,
            consolidatorName: formData.consolidatorName,
            notes: formData.notes
          }
        }
      ]);
      if (error) throw error;
      toast({
        title: "Visitante cadastrado com sucesso! 🎉",
        description: `${formData.name} foi cadastrado(a) em nosso sistema.`,
      });
      // Reset form
      setFormData({
        name: '',
        gender: '',
        cep: '',
        neighborhood: '',
        city: '',
        ageGroup: '',
        generation: '',
        phone: '',
        howDidYouHear: '',
        inviterName: '',
        consolidatorName: '',
        notes: ''
      });
      setCurrentStep(1);
      onNavigate('visitors');
    } catch (error) {
      console.error('Erro ao cadastrar visitante:', error);
      toast({
        title: "Erro ao cadastrar",
        description: "Ocorreu um erro ao tentar cadastrar o visitante. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const steps = [
    { number: 1, title: 'Dados Pessoais', icon: User },
    { number: 2, title: 'Endereço', icon: MapPin },
    { number: 3, title: 'Informações Adicionais', icon: ChevronDown }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-playfair font-bold text-gray-900">Cadastro de Visitante</h1>
              <p className="text-gray-600">Bem-vindo! Queremos conhecer você melhor</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                    currentStep >= step.number 
                      ? 'bg-church-primary border-church-primary text-white' 
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.number ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                      currentStep > step.number ? 'bg-church-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3">
              {steps.map((step) => (
                <div key={step.number} className="text-center flex-1">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-church-primary' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border p-8 animate-scale-in">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Dados Pessoais */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-playfair font-bold gradient-text mb-2">
                      Dados Pessoais
                    </h2>
                    <p className="text-gray-600">Informações básicas do visitante</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Nome do Visitante <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="input-church w-full"
                        placeholder="Nome completo do visitante"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Gênero <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="input-church w-full"
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Telefone <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="input-church w-full"
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Faixa Etária <span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        value={formData.ageGroup}
                        onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                        className="input-church w-full"
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="adolescente">Adolescente</option>
                        <option value="jovem">Jovem</option>
                        <option value="adulto">Adulto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Geração do Amigo
                      </label>
                      <select
                        value={formData.generation}
                        onChange={(e) => handleInputChange('generation', e.target.value)}
                        className="input-church w-full"
                      >
                        <option value="">Selecione</option>
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

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Como conheceu a Vida Nova Hortolândia? *
                      </label>
                      <select
                        value={formData.howDidYouHear}
                        onChange={(e) => handleInputChange('howDidYouHear', e.target.value)}
                        className="input-church w-full"
                        required
                      >
                        <option value="">Selecione</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="amigo_fora">Um amigo de fora da igreja</option>
                        <option value="amigo_igreja">Um amigo que já frequenta a igreja</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da pessoa que convidou
                      </label>
                      <input
                        type="text"
                        value={formData.inviterName}
                        onChange={(e) => handleInputChange('inviterName', e.target.value)}
                        className="input-church w-full"
                        placeholder="Nome de quem convidou o visitante"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Endereço */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-playfair font-bold gradient-text mb-2">
                      Endereço
                    </h2>
                    <p className="text-gray-600">Informações de localização do visitante</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        CEP <span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.cep}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            const formattedValue = value.replace(/(\d{5})(\d{1,3})?/, '$1-$2');
                            handleInputChange('cep', formattedValue);
                          }}
                          className="input-church w-48"
                          placeholder="00000-000"
                          maxLength={9}
                          required
                        />
                        <button
                          type="button"
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
                          onClick={async () => {
                            const cep = formData.cep.replace(/\D/g, '');
                            if (cep.length === 8) {
                              setIsLoadingCep(true);
                              try {
                                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                                const data = await response.json();
                                if (!data.erro) {
                                  setFormData(prev => ({
                                    ...prev,
                                    neighborhood: data.bairro || '',
                                    city: data.localidade && data.uf ? `${data.localidade}/${data.uf}` : ''
                                  }));
                                  
                                  // Focar no campo de bairro após preenchimento automático
                                  document.getElementById('neighborhood')?.focus();
                                } else {
                                  toast({
                                    title: "CEP não encontrado",
                                    description: "Verifique o CEP e tente novamente.",
                                    variant: "destructive"
                                  });
                                }
                              } catch (error) {
                                console.error('Erro ao buscar CEP:', error);
                                toast({
                                  title: "Erro ao buscar CEP",
                                  description: "Não foi possível consultar o CEP. Verifique sua conexão e tente novamente.",
                                  variant: "destructive"
                                });
                              } finally {
                                setIsLoadingCep(false);
                              }
                            } else {
                              toast({
                                title: "CEP inválido",
                                description: "Digite um CEP válido com 8 dígitos.",
                                variant: "destructive"
                              });
                            }
                          }}
                        >
                          {isLoadingCep ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Buscando...
                            </span>
                          ) : 'Buscar CEP'}
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Bairro <span className="text-red-500 ml-1">*</span>
                      </label>
                        <input
                          id="neighborhood"
                          type="text"
                          value={formData.neighborhood}
                          onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                          className="input-church w-full"
                          placeholder="Nome do bairro"
                          required
                          disabled={isLoadingCep}
                        />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Cidade/UF <span className="text-red-500 ml-1">*</span>
                      </label>
                        <input
                          id="city"
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="input-church w-full"
                          placeholder="Cidade/Estado"
                          required
                          disabled={isLoadingCep}
                        />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Informações Adicionais */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-playfair font-bold gradient-text mb-2">
                      Informações Adicionais
                    </h2>
                    <p className="text-gray-600">Dados complementares do visitante</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Nome do Consolidador <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.consolidatorName}
                        onChange={(e) => handleInputChange('consolidatorName', e.target.value)}
                        className="input-church w-full"
                        placeholder="Nome do consolidador responsável"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observações do Consolidador
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={4}
                        className="input-church w-full resize-none"
                        placeholder="Anotações importantes sobre o visitante"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Anterior
                  </button>
                )}
                
                <div className="ml-auto">
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-church"
                      disabled={currentStep === 1 && !formData.name}
                    >
                      Próximo
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn-church bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center min-w-[180px]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Salvando...
                        </>
                      ) : 'Finalizar Cadastro'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorForm;
