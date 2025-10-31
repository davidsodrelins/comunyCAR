import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Send, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function SendAlert() {
  const [, setLocation] = useLocation();
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [alertType, setAlertType] = useState<string>("");
  const [customMessage, setCustomMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fixedAlerts = [
    { id: "lights", title: "Faróis Acesos", description: "O farol do veículo está aceso" },
    { id: "tire", title: "Pneu Furado/Baixo", description: "Um dos pneus parece estar furado ou muito baixo" },
    { id: "door", title: "Porta Aberta", description: "A porta ou porta-malas está aberta" },
    { id: "leak", title: "Vazamento de Fluido", description: "Há vazamento de óleo, água ou outro fluido" },
    { id: "alarm", title: "Alarme Disparado", description: "O alarme do veículo está disparado" },
    { id: "obstruction", title: "Obstrução de Via", description: "O veículo está obstruindo uma garagem/passagem" },
    { id: "other", title: "Outro Problema", description: "Há outro problema com o veículo" }
  ];

  const handleSendAlert = async () => {
    if (!vehiclePlate.trim()) {
      alert("Por favor, informe a placa do veículo");
      return;
    }

    if (!alertType) {
      alert("Por favor, selecione um tipo de alerta");
      return;
    }

    setIsLoading(true);
    try {
      // Aqui você chamaria a API tRPC para enviar o alerta
      // await trpc.alerts.sendFixed.mutate({ vehiclePlate, alertType });
      
      setSuccessMessage(`✅ Alerta enviado com sucesso para ${vehiclePlate}!`);
      setVehiclePlate("");
      setAlertType("");
      setCustomMessage("");
      
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      alert("Erro ao enviar alerta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enviar Alerta</h1>
            <p className="text-gray-600">Informe o proprietário sobre um problema com seu veículo</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-green-700 font-semibold">{successMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* Vehicle Plate Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Identificar Veículo</CardTitle>
            <CardDescription>Digite a placa do veículo (formato: ABC-1234)</CardDescription>
          </CardHeader>
          <CardContent>
            <input
              type="text"
              placeholder="ABC-1234"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </CardContent>
        </Card>

        {/* Alert Type Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Tipo de Alerta
            </CardTitle>
            <CardDescription>Selecione o tipo de problema observado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fixedAlerts.map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => setAlertType(alert.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    alertType === alert.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Message (Optional) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Mensagem Personalizada (Opcional)
            </CardTitle>
            <CardDescription>Adicione detalhes extras (requer créditos)</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              placeholder="Ex: O farol esquerdo está muito brilhante, pode estar com mau funcionamento..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            {customMessage && (
              <p className="text-sm text-yellow-600 mt-2">
                ⚠️ Mensagens personalizadas custam 1 crédito
              </p>
            )}
          </CardContent>
        </Card>

        {/* Send Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleSendAlert}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg"
          >
            <Send className="w-5 h-5 mr-2" />
            {isLoading ? "Enviando..." : "Enviar Alerta"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="px-6 py-6"
          >
            Cancelar
          </Button>
        </div>

        {/* Info Box */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3">ℹ️ Como Funciona</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✅ O proprietário receberá notificação por email, WhatsApp e push</li>
              <li>✅ Alertas fixos são gratuitos</li>
              <li>✅ Mensagens personalizadas custam 1 crédito</li>
              <li>✅ Você permanece anônimo</li>
              <li>✅ O proprietário pode responder com uma mensagem fixa</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
