import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!validateEmail(email)) {
      newErrors.email = "Email inválido";
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    try {
      // Simular login
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccessMessage("Login realizado com sucesso!");
      setTimeout(() => {
        setLocation("/");
      }, 1000);
    } catch (error) {
      setErrors({ submit: "Erro ao fazer login. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              🚗
            </div>
          </div>
          <CardTitle className="text-2xl">comunyCAR</CardTitle>
          <CardDescription>Faça login na sua conta</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">{successMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">{errors.submit}</span>
              </div>
            )}

            {/* Email */}
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

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors(prev => ({ ...prev, password: "" }));
                  }}
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
              {errors.password && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Lembrar-me</span>
              </label>
              <button
                type="button"
                onClick={() => setLocation("/forgot-password")}
                className="text-sm text-blue-600 hover:underline font-semibold"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">ou</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => alert("Google login em desenvolvimento")}
            >
              🔵 Entrar com Google
            </Button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600">
              Não tem uma conta?{" "}
              <button
                type="button"
                onClick={() => setLocation("/signup")}
                className="text-blue-600 hover:underline font-semibold"
              >
                Cadastre-se
              </button>
            </p>
          </form>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Demo Credentials</h3>
            <p className="text-sm text-blue-800 mb-1">
              <strong>Email:</strong> demo@example.com
            </p>
            <p className="text-sm text-blue-800">
              <strong>Senha:</strong> Demo123!@#
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
