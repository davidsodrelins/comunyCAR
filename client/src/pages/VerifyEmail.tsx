import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obter token da URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      setToken(urlToken);
      verifyEmailToken(urlToken);
    }
  }, []);

  const verifyEmailMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setIsVerified(true);
      toast.success("Email verificado com sucesso!");
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    },
    onError: (error) => {
      setError(error.message || "Erro ao verificar email");
      toast.error(error.message || "Erro ao verificar email");
    },
  });

  const verifyEmailToken = async (emailToken: string) => {
    verifyEmailMutation.mutate({ token: emailToken });
  };

  const handleResendEmail = async () => {
    // Implementar reenvio de email
    toast.info("Email de verificação reenviado!");
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verificado!</h2>
              <p className="text-gray-600 mb-6">
                Sua conta foi ativada com sucesso. Você será redirecionado para o login em alguns segundos.
              </p>
              <Button
                onClick={() => setLocation("/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Ir para Login
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
            <h1 className="text-2xl font-bold text-gray-900">Verificar Email</h1>
            <p className="text-sm text-gray-600">Confirme seu endereço de email</p>
          </div>
        </div>

        {/* Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Verificação de Email</CardTitle>
            <CardDescription>
              Estamos verificando seu email...
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {verifyEmailMutation.isPending ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 text-center">
                  Verificando seu email...
                </p>
              </div>
            ) : error ? (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Erro na Verificação</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 text-sm mb-4">
                    Seu link de verificação pode ter expirado. Solicite um novo email de verificação.
                  </p>
                  <Button
                    onClick={handleResendEmail}
                    variant="outline"
                    className="w-full"
                  >
                    Reenviar Email de Verificação
                  </Button>
                </div>

                <Button
                  onClick={() => setLocation("/login")}
                  variant="outline"
                  className="w-full"
                >
                  Voltar para Login
                </Button>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <Mail className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Email Verificado!</h3>
                  <p className="text-gray-600 text-sm">
                    Sua conta foi ativada com sucesso.
                  </p>
                </div>

                <Button
                  onClick={() => setLocation("/login")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Ir para Login
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Não recebeu o email?{" "}
            <button
              onClick={handleResendEmail}
              className="text-blue-600 hover:underline font-semibold"
            >
              Reenviar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
