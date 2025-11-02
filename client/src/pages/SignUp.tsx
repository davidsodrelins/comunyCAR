import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, FileText, Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Formatadores
const formatCNPJ = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
};

const formatPhone = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
};

const validateCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length !== 14) return false;

  let sum = 0;
  let remainder;

  // Validar primeiro dígito
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * (i === 0 ? 5 : i === 1 ? 4 : 12 - (i - 1));
  }
  remainder = sum % 11;
  if (parseInt(cleaned[12]) !== (remainder < 2 ? 0 : 11 - remainder)) return false;

  // Validar segundo dígito
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * (i === 0 ? 6 : i === 1 ? 5 : 13 - (i - 1));
  }
  remainder = sum % 11;
  if (parseInt(cleaned[13]) !== (remainder < 2 ? 0 : 11 - remainder)) return false;

  return true;
};

export default function SignUp() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cnpj: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Cadastro realizado! Verifique seu email para confirmar.");
      setSubmitted(true);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar");
      setErrors({ submit: error.message || "Erro ao cadastrar" });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cnpj") {
      formattedValue = formatCNPJ(value);
    } else if (name === "phone") {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Nome
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Telefone
    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    } else if (formData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Telefone deve ter pelo menos 10 dígitos";
    }

    // CNPJ
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = "CNPJ é obrigatório";
    } else if (!validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = "CNPJ inválido";
    }

    // Senha
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 8) {
      newErrors.password = "Senha deve ter pelo menos 8 caracteres";
    }

    // Confirmar Senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não correspondem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      cnpj: formData.cnpj,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro Realizado!</h2>
              <p className="text-gray-600 mb-2">
                Verifique seu email para confirmar sua conta.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Enviamos um link de confirmação para <strong>{formData.email}</strong>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-blue-900 text-sm">
                  <strong>O que fazer agora:</strong>
                </p>
                <ol className="list-decimal list-inside text-blue-800 text-sm space-y-1 mt-2">
                  <li>Abra seu email</li>
                  <li>Clique no link de confirmação</li>
                  <li>Volte aqui e faça login</li>
                </ol>
              </div>
              <Button
                onClick={() => setLocation("/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-3"
              >
                Ir para Login
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="w-full"
              >
                Voltar para Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
            <p className="text-sm text-gray-600">Junte-se ao comunyCAR</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Cadastro de Usuário</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar sua conta
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{errors.submit}</p>
                </div>
              )}

              {/* Nome */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nome Completo
                </label>
                <Input
                  type="text"
                  name="name"
                  placeholder="João Silva"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={registerMutation.isPending}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="joao@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={registerMutation.isPending}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefone
                </label>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={registerMutation.isPending}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* CNPJ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  CNPJ
                </label>
                <Input
                  type="text"
                  name="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj}
                  onChange={handleChange}
                  disabled={registerMutation.isPending}
                  className={errors.cnpj ? "border-red-500" : ""}
                />
                {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>}
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Senha
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={registerMutation.isPending}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirmar Senha
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirme sua senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={registerMutation.isPending}
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                <p className="font-semibold mb-1">Próximos passos:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Você receberá um email de confirmação</li>
                  <li>Clique no link para ativar sua conta</li>
                  <li>Faça login com seu email e senha</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando Conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-600">
                Já tem uma conta?{" "}
                <button
                  type="button"
                  onClick={() => setLocation("/login")}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Fazer login
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
