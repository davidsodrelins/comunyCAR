import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useNavigate } from 'wouter';
import { trpc } from '@/lib/trpc';
import {
  AlertCircle,
  MessageSquare,
  Car,
  Zap,
  Settings,
  Send,
  Eye,
  MessageCircle,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  ArrowRight,
  Bell,
  Smartphone,
  Mail,
  Activity,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // tRPC Queries
  const vehiclesQuery = trpc.vehicles.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const creditsQuery = trpc.credits.getBalance.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const vehicleCount = vehiclesQuery.data?.length || 0;
  const creditBalance = creditsQuery.data?.balance || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bem-vindo, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Sistema conectado e funcionando
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/profile')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Perfil
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Car className="w-5 h-5" />}
            label="Veículos"
            value={vehicleCount}
            action={() => navigate('/vehicles')}
            actionLabel="Gerenciar"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Créditos"
            value={creditBalance.toFixed(2)}
            action={() => navigate('/buy-credits')}
            actionLabel="Comprar"
            highlight={creditBalance < 10}
          />
          <StatCard
            icon={<AlertCircle className="w-5 h-5" />}
            label="Alertas"
            value="0"
            action={() => navigate('/received-messages')}
            actionLabel="Ver"
          />
          <StatCard
            icon={<MessageSquare className="w-5 h-5" />}
            label="Mensagens"
            value="0"
            action={() => navigate('/received-messages')}
            actionLabel="Ver"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="overview">Resumo</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="actions">Ações</TabsTrigger>
            <TabsTrigger value="admin" className="hidden lg:block">
              Admin
            </TabsTrigger>
            <TabsTrigger value="settings" className="hidden lg:block">
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Veículos */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Meus Veículos
                  </h3>
                  <Car className="w-5 h-5 text-blue-600" />
                </div>
                {vehiclesQuery.isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : vehicleCount > 0 ? (
                  <div className="space-y-3">
                    {vehiclesQuery.data?.slice(0, 3).map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {vehicle.plate}
                          </p>
                          <p className="text-xs text-slate-600">
                            {vehicle.brand} {vehicle.model}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate('/vehicles')}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      className="w-full mt-4"
                      onClick={() => navigate('/vehicles')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Veículo
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Car className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">
                      Nenhum veículo cadastrado
                    </p>
                    <Button
                      className="mt-4 w-full"
                      onClick={() => navigate('/vehicles')}
                    >
                      Cadastrar Veículo
                    </Button>
                  </div>
                )}
              </Card>

              {/* Alertas */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Alertas Recentes
                  </h3>
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-center py-6">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">
                    Nenhum alerta recente
                  </p>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => navigate('/received-messages')}
                >
                  Ver Todos
                </Button>
              </Card>

              {/* Créditos */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Saldo de Créditos
                  </h3>
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-center py-4">
                  <p className="text-4xl font-bold text-blue-600">
                    {creditBalance.toFixed(0)}
                  </p>
                  <p className="text-sm text-slate-600 mt-2">créditos disponíveis</p>
                  {creditBalance < 10 && (
                    <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                      <p className="text-xs text-yellow-800 font-medium">
                        ⚠️ Saldo baixo
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/buy-credits')}
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Comprar Créditos
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Enviar Alerta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => navigate('/send-alert')}
                >
                  <AlertCircle className="w-6 h-6 mb-2" />
                  <span>Alerta Fixo (Gratuito)</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => navigate('/send-alert')}
                >
                  <MessageSquare className="w-6 h-6 mb-2" />
                  <span>Alerta Personalizado (5 créditos)</span>
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Histórico de Alertas
              </h3>
              <Button
                className="w-full"
                onClick={() => navigate('/received-messages')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Todos os Alertas Recebidos
              </Button>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Mensagens Recebidas
                </h3>
                <p className="text-sm text-slate-600 text-center py-4">
                  Nenhuma mensagem
                </p>
                <Button
                  className="w-full mt-4"
                  onClick={() => navigate('/received-messages')}
                >
                  Ver Todas
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Mensagens Enviadas
                </h3>
                <Button
                  className="w-full"
                  onClick={() => navigate('/sent-messages')}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Ver Mensagens Enviadas
                </Button>
              </Card>
            </div>
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionCard
                icon={<Car className="w-6 h-6" />}
                title="Gerenciar Veículos"
                description="Adicione, edite ou remova veículos"
                onClick={() => navigate('/vehicles')}
              />
              <ActionCard
                icon={<Send className="w-6 h-6" />}
                title="Enviar Alerta"
                description="Notifique proprietários de veículos"
                onClick={() => navigate('/send-alert')}
              />
              <ActionCard
                icon={<MessageSquare className="w-6 h-6" />}
                title="Ver Mensagens"
                description="Acompanhe alertas recebidos e enviados"
                onClick={() => navigate('/received-messages')}
              />
              <ActionCard
                icon={<DollarSign className="w-6 h-6" />}
                title="Comprar Créditos"
                description="Adquira créditos para alertas personalizados"
                onClick={() => navigate('/buy-credits')}
              />
              <ActionCard
                icon={<Bell className="w-6 h-6" />}
                title="Preferências"
                description="Configure notificações e alertas"
                onClick={() => navigate('/notifications')}
              />
              <ActionCard
                icon={<Users className="w-6 h-6" />}
                title="Usuários Secundários"
                description="Gerencie usuários dos seus veículos"
                onClick={() => navigate('/manage-secondary-users')}
              />
            </div>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Painel Administrativo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AdminActionCard
                  icon={<MessageSquare className="w-6 h-6" />}
                  title="Configurar WhatsApp"
                  description="Conecte e gerencie WhatsApp Web"
                  onClick={() => navigate('/whatsapp-admin')}
                />
                <AdminActionCard
                  icon={<Mail className="w-6 h-6" />}
                  title="Configurar Email"
                  description="Configure SMTP para envios"
                  onClick={() => navigate('/email-admin')}
                />
                <AdminActionCard
                  icon={<Smartphone className="w-6 h-6" />}
                  title="Configurar Firebase"
                  description="Configure notificações push"
                  onClick={() => navigate('/firebase-admin')}
                />
                <AdminActionCard
                  icon={<BarChart3 className="w-6 h-6" />}
                  title="Relatórios"
                  description="Visualize estatísticas e relatórios"
                  onClick={() => navigate('/reports')}
                />
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Configurações
              </h3>
              <div className="space-y-3">
                <SettingItem
                  label="Perfil"
                  description="Edite seus dados pessoais"
                  onClick={() => navigate('/profile')}
                />
                <SettingItem
                  label="Preferências de Notificação"
                  description="Configure como receber alertas"
                  onClick={() => navigate('/notifications')}
                />
                <SettingItem
                  label="Histórico de Transações"
                  description="Veja seus gastos com créditos"
                  onClick={() => navigate('/transaction-history')}
                />
                <SettingItem
                  label="Histórico de Alertas"
                  description="Acompanhe todos os alertas"
                  onClick={() => navigate('/alert-history')}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Landing Page for unauthenticated users
function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">comunyCAR</h1>
          <p className="text-xl text-blue-100 mb-8">
            Notifique proprietários de veículos com um simples clique
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => navigate('/login')}
            >
              Entrar
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/10"
              onClick={() => navigate('/signup')}
            >
              Cadastrar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<AlertCircle className="w-8 h-8" />}
            title="Alertas Rápidos"
            description="Envie alertas fixos gratuitamente ou personalizados com créditos"
          />
          <FeatureCard
            icon={<MessageSquare className="w-8 h-8" />}
            title="Mensagens em Tempo Real"
            description="Receba respostas e reações instantaneamente"
          />
          <FeatureCard
            icon={<Bell className="w-8 h-8" />}
            title="Multi-canal"
            description="Notificações por Email, WhatsApp e Push"
          />
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon, label, value, action, actionLabel, highlight }) {
  return (
    <Card
      className={`p-6 ${
        highlight ? 'border-yellow-300 bg-yellow-50' : ''
      } hover:shadow-lg transition`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-600">{label}</span>
        <span className="text-blue-600">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-4">{value}</p>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={action}
      >
        {actionLabel}
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </Card>
  );
}

function ActionCard({ icon, title, description, onClick }) {
  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 transition"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="text-blue-600">{icon}</div>
        <div>
          <h4 className="font-semibold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-400 ml-auto" />
      </div>
    </Card>
  );
}

function AdminActionCard({ icon, title, description, onClick }) {
  return (
    <Card
      className="p-6 cursor-pointer hover:shadow-lg hover:border-orange-300 transition border-orange-200 bg-orange-50"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className="text-orange-600">{icon}</div>
        <div>
          <h4 className="font-semibold text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-400 ml-auto" />
      </div>
    </Card>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 text-white border border-white/20">
      <div className="text-blue-200 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-blue-100">{description}</p>
    </div>
  );
}

function SettingItem({ label, description, onClick }) {
  return (
    <div
      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer"
      onClick={onClick}
    >
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-slate-400" />
    </div>
  );
}
