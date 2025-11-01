import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { AlertCircle, Users, Zap, Shield, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">comunyCAR</span>
          </div>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/login")}
              className="text-gray-700 hover:text-blue-600"
            >
              Entrar
            </Button>
            <Button
              onClick={() => setLocation("/signup")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Cadastrar
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Alertas de Veículos em
                <span className="text-blue-600"> Tempo Real</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Receba notificações instantâneas sobre problemas com seus veículos. Faróis acesos, pneus furados, portas abertas e muito mais.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button
                  onClick={() => setLocation("/signup")}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  Começar Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Saiba Mais
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-8 flex items-center justify-center min-h-96">
              <AlertCircle className="w-48 h-48 text-white opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Como Funciona
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-50 rounded-xl p-8 border border-blue-100">
              <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Receba Alertas
              </h3>
              <p className="text-gray-600">
                Qualquer pessoa pode enviar um alerta sobre seu veículo. Você recebe notificações por email, WhatsApp e push.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-green-50 rounded-xl p-8 border border-green-100">
              <div className="bg-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Reaja Rápido
              </h3>
              <p className="text-gray-600">
                Confirme que viu a mensagem com reações. O remetente saberá que você recebeu o alerta.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-purple-50 rounded-xl p-8 border border-purple-100">
              <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Seguro e Privado
              </h3>
              <p className="text-gray-600">
                Seus dados são protegidos. Você controla quem pode enviar alertas para seus veículos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Por Que Usar comunyCAR?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              "Alertas instantâneos sobre problemas com seu veículo",
              "Múltiplos canais de notificação (Email, WhatsApp, Push)",
              "Som de buzina em notificações push para não perder",
              "Reações para confirmar que viu a mensagem",
              "Histórico completo de alertas recebidos e enviados",
              "Gestão de múltiplos veículos e usuários secundários",
              "Alertas personalizados com créditos",
              "Dashboard intuitivo e fácil de usar",
            ].map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <p className="text-gray-700 text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Planos
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuito</h3>
              <p className="text-gray-600 mb-6">Para começar</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                R$ 0<span className="text-lg text-gray-600">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Alertas fixos ilimitados</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Até 3 veículos</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Notificações por email</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Começar
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-blue-600 rounded-xl p-8 text-white border-2 border-blue-600 transform scale-105">
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full inline-block text-sm font-semibold mb-4">
                Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-blue-100 mb-6">Para usuários frequentes</p>
              <div className="text-3xl font-bold mb-6">
                R$ 9,90<span className="text-lg text-blue-100">/mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>Tudo do plano Gratuito</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>Alertas personalizados</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>Até 10 veículos</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-300 flex-shrink-0" />
                  <span>WhatsApp e Push</span>
                </li>
              </ul>
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                Começar Agora
              </Button>
            </div>

            {/* Business Plan */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Business</h3>
              <p className="text-gray-600 mb-6">Para empresas</p>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                Customizado
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Veículos ilimitados</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">API customizada</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Suporte prioritário</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Contate-nos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Cadastre-se agora e receba seus primeiros alertas em minutos
          </p>
          <Button
            onClick={() => setLocation("/signup")}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8"
          >
            Criar Conta Grátis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">comunyCAR</h4>
              <p className="text-sm">Alertas de veículos em tempo real</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Recursos</a></li>
                <li><a href="#" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Segurança</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Sobre</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Termos</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 comunyCAR. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
