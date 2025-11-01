import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, CheckCircle, Mail } from "lucide-react";
import { useLocation } from "wouter";

export default function ForgotPassword() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(email)) {
      newErrors.email = "Email inválido";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      // Simular envio de email
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccessMessage(`Código de recuperação enviado para ${email}`);
      setTimeout(() => {
        setStep("code");
        setSuccessMessage("");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!verificationCode) {
      newErrors.code = "Código é obrigatório";
    } else if (verificationCode.length !== 6) {
      newErrors.code = "Código deve ter 6 dígitos";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      // Simular verificação
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccessMessage("Código verificado! Agora defina uma nova senha.");
      setTimeout(() => {
        setStep("reset");
        setSuccessMessage("");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!newPassword) {
      newErrors.newPassword = "Nova senha é obrigatória";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Senha deve ter no mínimo 8 caracteres";
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      // Simular reset de senha
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccessMessage("Senha redefinida com sucesso!");
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/login")}
              className="absolute left-4 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
          <CardDescription>
            {step === "email" && "Digite seu email para receber um código de recuperação"}
            {step === "code" && "Digite o código que enviamos para seu email"}
            {step === "reset" && "Defina uma nova senha"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">{successMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors(prev => ({ ...prev, email: "" }));
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2"
              >
                {isLoading ? "Enviando..." : "Enviar Código"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Lembrou a senha?{" "}
                <button
                  type="button"
                  onClick={() => setLocation("/login")}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Faça login
                </button>
              </p>
            </form>
          )}

          {/* Step 2: Code */}
          {step === "code" && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">{successMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Código de Recuperação
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setErrors(prev => ({ ...prev, code: "" }));
                  }}
                  maxLength={6}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-center text-2xl tracking-widest ${
                    errors.code ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.code && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.code}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2"
              >
                {isLoading ? "Verificando..." : "Verificar Código"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Não recebeu o código?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setEmail("");
                    setVerificationCode("");
                  }}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Reenviar
                </button>
              </p>
            </form>
          )}

          {/* Step 3: Reset Password */}
          {step === "reset" && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-semibold">{successMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors(prev => ({ ...prev, newPassword: "" }));
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.newPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.newPassword && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors(prev => ({ ...prev, confirmPassword: "" }));
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2"
              >
                {isLoading ? "Redefinindo..." : "Redefinir Senha"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
