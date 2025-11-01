import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, AlertCircle, Users, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Bem-vindo ao comunyCAR!",
      description: "Você está pronto para receber alertas sobre seus veículos em tempo real.",
      icon: AlertCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Adicione Seus Veículos",
      description: "Cadastre seus veículos informando a placa. Você pode adicionar quantos quiser.",
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      action: "Adicionar Veículo",
      actionLink: "/vehicles",
    },
    {
      title: "Convide Usuários Secundários",
      description: "Adicione familiares ou amigos como usuários secundários de seus veículos.",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Configure Notificações",
      description: "Escolha como deseja receber alertas: Email, WhatsApp ou Push.",
      icon: CheckCircle2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      action: "Configurar Notificações",
      actionLink: "/notifications",
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setLocation("/");
    }
  };

  const handleSkip = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= step ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Passo {step + 1} de {steps.length}
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-2xl overflow-hidden">
          <div className={`${currentStep.bgColor} p-12 text-center`}>
            <Icon className={`w-24 h-24 ${currentStep.color} mx-auto mb-6`} />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {currentStep.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto mb-8">
              {currentStep.description}
            </p>

            {/* Features List */}
            <div className="bg-white rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
              {step === 0 && (
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Alertas instantâneos</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Múltiplos canais de notificação</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Som de buzina em push</span>
                  </li>
                </ul>
              )}
              {step === 1 && (
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Até 10 veículos por conta</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Informações completas do veículo</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Gerenciamento fácil</span>
                  </li>
                </ul>
              )}
              {step === 2 && (
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Compartilhe com familiares</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Controle de permissões</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Todos recebem alertas</span>
                  </li>
                </ul>
              )}
              {step === 3 && (
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Email, WhatsApp e Push</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Horas silenciosas</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">Som de buzina customizável</span>
                  </li>
                </ul>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="px-8"
              >
                Pular
              </Button>
              {currentStep.actionLink && (
                <Button
                  onClick={() => setLocation(currentStep.actionLink!)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  {currentStep.action}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                {step === steps.length - 1 ? "Começar" : "Próximo"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
