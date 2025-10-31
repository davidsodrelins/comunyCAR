import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { AlertCircle, Car, MessageSquare, Zap, Shield, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Car className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Bem-vindo, {user?.name}!</span>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Send Alert Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/send-alert")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Enviar Alerta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Envie alertas para proprietários de veículos sobre problemas observados.
                </p>
                <div className="space-y-2">
                  <p className="text-sm">✅ Alertas fixos (gratuitos)</p>
                  <p className="text-sm">✅ Alertas personalizados (com créditos)</p>
                </div>
              </CardContent>
            </Card>

            {/* Vehicles Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/vehicles")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-500" />
                  Meus Veículos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Gerencie seus veículos e adicione usuários secundários.
                </p>
                <div className="space-y-2">
                  <p className="text-sm">✅ Cadastrar veículos</p>
                  <p className="text-sm">✅ Adicionar usuários</p>
                </div>
              </CardContent>
            </Card>

            {/* Credits Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setLocation("/buy-credits")}> 
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Comprar Créditos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Compre créditos para enviar alertas personalizados.
                </p>
                <div className="space-y-2">
                  <p className="text-sm">✅ Pacotes com desconto</p>
                  <p className="text-sm">✅ Pagamento via PayPal</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <section className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Como Funciona</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">1. Identifique o Problema</h3>
                <p className="text-gray-600">
                  Veja um veículo com problemas (faróis acesos, pneu furado, etc)?
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">2. Informe a Placa</h3>
                <p className="text-gray-600">
                  Digite a placa do veículo e selecione o tipo de alerta.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-bold text-lg mb-2">3. Envie o Alerta</h3>
                <p className="text-gray-600">
                  O proprietário recebe notificação por email, WhatsApp e push.
                </p>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="bg-indigo-50 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Benefícios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-2">Segurança</h3>
                  <p className="text-gray-700">
                    Ajude proprietários a proteger seus veículos de forma anônima e segura.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-2">Rápido</h3>
                  <p className="text-gray-700">
                    Notificação instantânea via múltiplos canais (email, WhatsApp, push).
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Zap className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-2">Gratuito</h3>
                  <p className="text-gray-700">
                    Envie alertas fixos sem custo. Alertas personalizados com créditos.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <MessageSquare className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold mb-2">Comunidade</h3>
                  <p className="text-gray-700">
                    Faça parte de uma comunidade que se ajuda mutuamente.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; 2024 {APP_TITLE} - Conectando pedestres com proprietários de veículos</p>
          </div>
        </footer>
      </div>
    );
  }

  // Landing Page para usuários não autenticados
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800">
      {/* Header */}
      <header className="bg-transparent py-6 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Car className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">{APP_TITLE}</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center text-white mb-12">
          <h2 className="text-5xl font-bold mb-6">
            Ajude Proprietários de Veículos
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Envie alertas sobre problemas em veículos e ajude a comunidade a se proteger.
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Começar Agora
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Alertas Fixos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Escolha entre 7 tipos de alertas predefinidos para informar sobre problemas comuns.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Alertas Personalizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Envie mensagens customizadas com créditos para situações específicas.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Notificações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Proprietários recebem alertas por email, WhatsApp e push instantaneamente.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-white/10 backdrop-blur-md rounded-lg p-12 text-center text-white border border-white/20">
          <h3 className="text-3xl font-bold mb-4">Pronto para Começar?</h3>
          <p className="text-lg mb-8 text-blue-100">
            Cadastre-se agora e comece a ajudar a comunidade.
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 font-bold"
            onClick={() => window.location.href = getLoginUrl()}
          >
            Fazer Login / Cadastro
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black/20 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 {APP_TITLE} - Conectando pedestres com proprietários de veículos</p>
        </div>
      </footer>
    </div>
  );
}
