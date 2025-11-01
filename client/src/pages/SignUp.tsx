import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"form" | "verification">("form");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cnpj: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateCNPJ = (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, "");
    if (cleanCNPJ.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    return true;
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[^\d]/g, "");
    return cleanPhone.length === 11;
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Telefone deve ter 11 dígitos (com DDD)";
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = "CNPJ é obrigatório";
    } else if (!validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = "CNPJ inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 8) {
      newErrors.password = "Senha deve ter no mínimo 8 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Você deve aceitar os termos de serviço";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Simular envio de email de verificação
      await new Promise(resolve => setTimeout(resolve, 1500));
      setVerificationSent(true);
      setStep("verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      setErrors({ verification: "Código de verificação é obrigatório" });
      return;
    }

    setIsLoading(true);
    try {
      // Simular verificação
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Redirecionar para login
      alert("Cadastro realizado com sucesso! Faça login para continuar.");
      setLocation("/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "verification") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Verificar Email</CardTitle>
            <CardDescription>
              Enviamos um código de verificação para {formData.email}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código de Verificação
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                />
                {errors.verification && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.verification}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2"
              >
                {isLoading ? "Verificando..." : "Verificar Email"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setStep("form")}
              >
                Voltar
              </Button>

              <p className="text-center text-sm text-gray-600">
                Não recebeu o código?{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:underline font-semibold"
                  onClick={() => setVerificationSent(false)}
                >
                  Reenviar
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>Cadastre-se no comunyCAR</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                placeholder="João Silva"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* CNPJ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                placeholder="12.345.678/0001-90"
                value={formData.cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.cnpj ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {errors.cnpj && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.cnpj}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                    errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < passwordStrength ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {passwordStrength === 0 && "Muito fraca"}
                    {passwordStrength === 1 && "Fraca"}
                    {passwordStrength === 2 && "Média"}
                    {passwordStrength === 3 && "Forte"}
                    {passwordStrength === 4 && "Muito forte"}
                  </p>
                </div>
              )}

              {errors.password && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                    errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Senhas coincidem
                </p>
              )}

              {errors.confirmPassword && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">
                Concordo com os{" "}
                <a href="#" className="text-blue-600 hover:underline font-semibold">
                  termos de serviço
                </a>{" "}
                e{" "}
                <a href="#" className="text-blue-600 hover:underline font-semibold">
                  política de privacidade
                </a>
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.agreeTerms}
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2"
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600">
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={() => setLocation("/login")}
                className="text-blue-600 hover:underline font-semibold"
              >
                Faça login
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
