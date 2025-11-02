import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, FileText, Lock, Save, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function UserProfile() {
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dados do perfil
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    cnpj: "",
  });

  // Dados de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutations
  const updateProfileMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar perfil");
      setErrors({ submit: error.message || "Erro ao atualizar perfil" });
    },
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao alterar senha");
      setErrors({ submit: error.message || "Erro ao alterar senha" });
    },
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateProfileForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (profileData.name.trim().length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!profileData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    } else if (profileData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Telefone deve ter pelo menos 10 dígitos";
    }

    if (!profileData.cnpj.trim()) {
      newErrors.cnpj = "CNPJ é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Senha atual é obrigatória";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "Nova senha é obrigatória";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Senha deve ter pelo menos 8 caracteres";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não correspondem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    updateProfileMutation.mutate({
      name: profileData.name,
      phone: profileData.phone,
      cnpj: profileData.cnpj,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600">Gerenciar suas informações pessoais e segurança</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "profile" ? "default" : "outline"}
            onClick={() => setActiveTab("profile")}
            className="flex-1"
          >
            <User className="w-4 h-4 mr-2" />
            Dados Pessoais
          </Button>
          <Button
            variant={activeTab === "password" ? "default" : "outline"}
            onClick={() => setActiveTab("password")}
            className="flex-1"
          >
            <Lock className="w-4 h-4 mr-2" />
            Segurança
          </Button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
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
                    value={profileData.name}
                    onChange={handleProfileChange}
                    disabled={updateProfileMutation.isPending}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Email (apenas leitura) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
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
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    disabled={updateProfileMutation.isPending}
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
                    value={profileData.cnpj}
                    onChange={handleProfileChange}
                    disabled={updateProfileMutation.isPending}
                    className={errors.cnpj ? "border-red-500" : ""}
                  />
                  {errors.cnpj && <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Mantenha sua conta segura alterando sua senha regularmente
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Submit Error */}
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{errors.submit}</p>
                  </div>
                )}

                {/* Senha Atual */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Senha Atual
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="currentPassword"
                      placeholder="Digite sua senha atual"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      disabled={changePasswordMutation.isPending}
                      className={errors.currentPassword ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                  )}
                </div>

                {/* Nova Senha */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Nova Senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="Mínimo 8 caracteres"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      disabled={changePasswordMutation.isPending}
                      className={errors.newPassword ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirme sua nova senha"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      disabled={changePasswordMutation.isPending}
                      className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                  <p className="font-semibold mb-1">Requisitos de senha:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Mínimo de 8 caracteres</li>
                    <li>Recomenda-se usar letras, números e símbolos</li>
                    <li>Evite senhas óbvias ou fáceis de adivinhar</li>
                  </ul>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Alterando Senha...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Alterar Senha
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
