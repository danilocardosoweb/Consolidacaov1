
import React, { useState } from 'react';
import { Users, UserPlus, BarChart3, Calendar, Heart, ArrowRight, Sparkles, FileText } from 'lucide-react';
import Dashboard from '../components/Dashboard';
import VisitorForm from '../components/VisitorForm';
import Settings from '../components/Settings';
import ExportData from '../components/ExportData';
import MonthlyReport from '../components/MonthlyReport';

const Index = () => {
  const [currentView, setCurrentView] = useState('home');

  if (currentView === 'dashboard') {
    return <Dashboard onNavigate={setCurrentView} />;
  }

  if (currentView === 'register') {
    return <VisitorForm onNavigate={setCurrentView} />;
  }

  if (currentView === 'settings') {
    return <Settings onNavigate={setCurrentView} />;
  }

  if (currentView === 'export') {
    return <ExportData onNavigate={setCurrentView} />;
  }

  if (currentView === 'monthly-report') {
    return <MonthlyReport onNavigate={setCurrentView} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-church-primary/10 to-church-secondary/10"></div>
        <nav className="relative z-10 container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-church-primary to-church-secondary rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-playfair font-bold gradient-text">
                Sistema Igreja
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="text-gray-600 hover:text-church-primary transition-colors duration-300"
              >
                Dashboard
              </button>
              <button 
                onClick={() => setCurrentView('monthly-report')}
                className="text-gray-600 hover:text-church-primary transition-colors duration-300"
              >
                Relatórios
              </button>
              <button 
                onClick={() => setCurrentView('register')}
                className="btn-church"
              >
                Cadastrar Visitante
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <h2 className="text-5xl md:text-7xl font-playfair font-bold mb-6">
              <span className="gradient-text">Bem-vindos</span>
              <br />
              <span className="text-gray-800">à Nossa Igreja</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Sistema moderno e intuitivo para cadastramento de visitantes. 
              Gerencie presenças com elegância e eficiência.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => setCurrentView('register')}
                className="group btn-church text-lg px-8 py-4 flex items-center space-x-3"
              >
                <UserPlus className="w-6 h-6" />
                <span>Cadastrar Visitante</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => setCurrentView('dashboard')}
                className="glass-effect px-8 py-4 rounded-xl text-gray-700 hover:bg-white/90 transition-all duration-300 flex items-center space-x-3"
              >
                <BarChart3 className="w-6 h-6" />
                <span>Ver Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="w-4 h-4 bg-church-primary/30 rounded-full"></div>
        </div>
        <div className="absolute top-32 right-20 animate-bounce delay-1000">
          <div className="w-6 h-6 bg-church-secondary/30 rounded-full"></div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-bounce delay-500">
          <Sparkles className="w-8 h-8 text-church-accent/50" />
        </div>
      </section>

      {/* Features Cards */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-playfair font-bold mb-4 gradient-text">
              Funcionalidades
            </h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar visitantes de forma moderna e eficiente
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="group glass-effect p-8 rounded-2xl hover-lift animate-scale-in">
              <div className="w-16 h-16 bg-gradient-to-r from-church-primary to-church-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-800">Cadastro Rápido</h4>
              <p className="text-gray-600 leading-relaxed">
                Interface intuitiva para cadastro de visitantes em poucos cliques. 
                Formulário otimizado para máxima eficiência.
              </p>
            </div>

            <div className="group glass-effect p-8 rounded-2xl hover-lift animate-scale-in delay-200">
              <div className="w-16 h-16 bg-gradient-to-r from-church-accent to-church-warm rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-800">Dashboard Completo</h4>
              <p className="text-gray-600 leading-relaxed">
                Visualize estatísticas em tempo real, acompanhe o crescimento 
                e gere relatórios detalhados.
              </p>
            </div>

            <div className="group glass-effect p-8 rounded-2xl hover-lift animate-scale-in delay-400">
              <div className="w-16 h-16 bg-gradient-to-r from-church-gold to-church-warm rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-800">Gestão Avançada</h4>
              <p className="text-gray-600 leading-relaxed">
                Gerencie todos os visitantes com filtros avançados, 
                busca inteligente e organização por categorias.
              </p>
            </div>

            <div 
              onClick={() => setCurrentView('monthly-report')}
              className="group glass-effect p-8 rounded-2xl hover-lift animate-scale-in delay-600 cursor-pointer"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-glow">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-semibold mb-4 text-gray-800">Relatórios Inteligentes</h4>
              <p className="text-gray-600 leading-relaxed">
                Análises avançadas com insights automatizados 
                e recomendações estratégicas para crescimento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-church-primary/5 to-church-secondary/5">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-slide-up">
              <div className="text-4xl font-bold gradient-text mb-2">1,250+</div>
              <div className="text-gray-600">Visitantes Cadastrados</div>
            </div>
            <div className="animate-slide-up delay-200">
              <div className="text-4xl font-bold gradient-text mb-2">98%</div>
              <div className="text-gray-600">Satisfação dos Usuários</div>
            </div>
            <div className="animate-slide-up delay-400">
              <div className="text-4xl font-bold gradient-text mb-2">24/7</div>
              <div className="text-gray-600">Sistema Disponível</div>
            </div>
            <div className="animate-slide-up delay-600">
              <div className="text-4xl font-bold gradient-text mb-2">100%</div>
              <div className="text-gray-600">Dados Seguros</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-church-primary to-church-secondary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-playfair font-bold">Sistema Igreja</h1>
          </div>
          <p className="text-gray-400">
            Feito com ❤️ para conectar pessoas e fortalecer comunidades
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
