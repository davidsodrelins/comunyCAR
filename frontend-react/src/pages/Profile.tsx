import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone, FileText, Calendar, Edit2, Save, X } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "(11) 99999-9999",
    cnpj: "12.345.678/0001-90",
    company: "Empresa LTDA",
  });

  const handleSave = () => {
    // Aqui você chamaria a API para salvar os dados
    console.log("Salvando perfil:", formData);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
            <p className="text-gray-600">Gerencie suas informações pessoais</p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Seus dados cadastrais</CardDescription>
            </div>
            <Button
              variant={isEditing ? "destructive" : "default"}
              onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Editar
                </>
              )}
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome Completo
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{formData.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{formData.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-4 h-4" />
                Telefone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{formData.phone}</p>
              )}
            </div>

            {/* CNPJ */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                CNPJ
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  placeholder="12.345.678/0001-90"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{formData.cnpj}</p>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Empresa/Razão Social
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{formData.company}</p>
              )}
            </div>

            {/* Save Button */}
            {isEditing && (
              <Button
                onClick={handleSave}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Account Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Créditos Disponíveis</p>
                <p className="text-3xl font-bold text-blue-600">15</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Alertas Enviados</p>
                <p className="text-3xl font-bold text-green-600">42</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Veículos Cadastrados</p>
                <p className="text-3xl font-bold text-purple-600">3</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card className="mb-6 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Informações da Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Membro desde:</span>
              <span className="font-semibold">15 de Outubro de 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Último acesso:</span>
              <span className="font-semibold">Hoje às 15:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-green-600">✓ Ativo</span>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
            <CardDescription>Ações irreversíveis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-100"
            >
              Alterar Senha
            </Button>
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-100"
            >
              Desativar Conta
            </Button>
            <Button
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-100"
            >
              Deletar Conta Permanentemente
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
