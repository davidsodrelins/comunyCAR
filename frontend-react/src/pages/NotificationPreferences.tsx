import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, MessageCircle, Bell, Save } from "lucide-react";
import { useLocation } from "wouter";

export default function NotificationPreferences() {
  const [, setLocation] = useLocation();
  interface Preferences {
    emailAlerts: boolean;
    emailDigest: boolean;
    emailFrequency: string;
    whatsappAlerts: boolean;
    whatsappConnected: boolean;
    whatsappNumber: string;
    pushAlerts: boolean;
    pushSound: boolean;
    pushBuzzer: boolean;
    quietHours: boolean;
    quietStart: string;
    quietEnd: string;
  }

  const [preferences, setPreferences] = useState<Preferences>({
    emailAlerts: true,
    emailDigest: true,
    emailFrequency: "instant",
    whatsappAlerts: true,
    whatsappConnected: false,
    whatsappNumber: "",
    pushAlerts: true,
    pushSound: true,
    pushBuzzer: true,
    quietHours: false,
    quietStart: "22:00",
    quietEnd: "08:00",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof Preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChange = (key: keyof Preferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Preferências salvas com sucesso!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectWhatsapp = () => {
    alert("Redirecionando para conexão WhatsApp...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">Preferências de Notificação</h1>
            <p className="text-gray-600">Configure como você quer receber alertas</p>
          </div>
        </div>

        {/* Email Notifications */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>Notificações por Email</CardTitle>
                <CardDescription>Receba alertas no seu email</CardDescription>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailAlerts}
                onChange={() => handleToggle("emailAlerts")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </CardHeader>

          {preferences.emailAlerts && (
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Frequência de Notificações
                </label>
                <select
                  value={preferences.emailFrequency}
                  onChange={(e) => handleChange("emailFrequency", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="instant">Instantaneamente</option>
                  <option value="hourly">A cada hora</option>
                  <option value="daily">Diariamente</option>
                  <option value="weekly">Semanalmente</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailDigest}
                  onChange={() => handleToggle("emailDigest")}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-700">Enviar resumo diário de alertas</span>
              </label>
            </CardContent>
          )}
        </Card>

        {/* WhatsApp Notifications */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-green-600" />
              <div>
                <CardTitle>Notificações por WhatsApp</CardTitle>
                <CardDescription>Receba alertas no WhatsApp</CardDescription>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.whatsappAlerts}
                onChange={() => handleToggle("whatsappAlerts")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </CardHeader>

          {preferences.whatsappAlerts && (
            <CardContent className="space-y-4">
              {preferences.whatsappConnected ? (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-semibold">✓ WhatsApp Conectado</p>
                    <p className="text-green-700 text-sm">Número: {preferences.whatsappNumber}</p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setPreferences(prev => ({
                        ...prev,
                        whatsappConnected: false,
                        whatsappNumber: ""
                      }));
                    }}
                  >
                    Desconectar WhatsApp
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 text-sm">
                    Conecte seu WhatsApp para receber alertas instantaneamente.
                  </p>
                  <Button
                    onClick={handleConnectWhatsapp}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    Conectar WhatsApp
                  </Button>
                </>
              )}
            </CardContent>
          )}
        </Card>

        {/* Push Notifications */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-purple-600" />
              <div>
                <CardTitle>Notificações Push</CardTitle>
                <CardDescription>Receba alertas no seu dispositivo</CardDescription>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.pushAlerts}
                onChange={() => handleToggle("pushAlerts")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </CardHeader>

          {preferences.pushAlerts && (
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.pushSound}
                  onChange={() => handleToggle("pushSound")}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-gray-700">Ativar som de notificação</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.pushBuzzer}
                  onChange={() => handleToggle("pushBuzzer")}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-gray-700">Ativar som de buzina (para alertas de veículos)</span>
              </label>
            </CardContent>
          )}
        </Card>

        {/* Quiet Hours */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Horas Silenciosas</CardTitle>
              <CardDescription>Não receber notificações durante este período</CardDescription>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.quietHours}
                onChange={() => handleToggle("quietHours")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </CardHeader>

          {preferences.quietHours && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Início
                  </label>
                  <input
                    type="time"
                    value={preferences.quietStart}
                    onChange={(e) => handleChange("quietStart", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fim
                  </label>
                  <input
                    type="time"
                    value={preferences.quietEnd}
                    onChange={(e) => handleChange("quietEnd", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Salvando..." : "Salvar Preferências"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>

        {/* Info Box */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3">ℹ️ Dicas</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✅ Você sempre receberá alertas sobre seus veículos</li>
              <li>✅ Horas silenciosas não afetam alertas críticos</li>
              <li>✅ Conecte WhatsApp para receber mensagens instantaneamente</li>
              <li>✅ O som de buzina é ideal para alertas urgentes</li>
              <li>✅ Você pode alterar essas preferências a qualquer momento</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
