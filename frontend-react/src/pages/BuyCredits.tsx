import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Zap, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  discount?: number;
  popular?: boolean;
  description: string;
}

export default function BuyCredits() {
  const [, setLocation] = useLocation();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const packages: CreditPackage[] = [
    {
      id: "small",
      credits: 10,
      price: 9.90,
      description: "Perfeito para começar"
    },
    {
      id: "medium",
      credits: 25,
      price: 19.90,
      discount: 5,
      description: "Melhor custo-benefício"
    },
    {
      id: "large",
      credits: 50,
      price: 39.90,
      discount: 10,
      popular: true,
      description: "Mais popular"
    },
    {
      id: "xlarge",
      credits: 100,
      price: 69.90,
      discount: 20,
      description: "Máxima economia"
    }
  ];

  const handleBuyCredits = async () => {
    if (!selectedPackage) {
      alert("Por favor, selecione um pacote");
      return;
    }

    setIsProcessing(true);
    try {
      // Simular redirecionamento para PayPal
      // await trpc.payments.createPayment.mutate({...})
      alert("Redirecionando para PayPal...");
    } catch (error) {
      alert("Erro ao processar pagamento");
    } finally {
      setIsProcessing(false);
    }
  };

  const getDiscountedPrice = (pkg: CreditPackage): number => {
    if (!pkg.discount) return pkg.price;
    return pkg.price - (pkg.price * pkg.discount / 100);
  };

  const getSavings = (pkg: CreditPackage): number => {
    if (!pkg.discount) return 0;
    return pkg.price * pkg.discount / 100;
  };

  const getPricePerCredit = (pkg: CreditPackage): number => {
    return getDiscountedPrice(pkg) / pkg.credits;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-5xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">Comprar Créditos</h1>
            <p className="text-gray-600">Envie alertas personalizados para proprietários de veículos</p>
          </div>
        </div>

        {/* Current Balance */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-2">Seu Saldo Atual</p>
                <h2 className="text-4xl font-bold">15 Créditos</h2>
              </div>
              <Zap className="w-16 h-16 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedPackage === pkg.id
                  ? "ring-2 ring-blue-500 border-blue-500"
                  : "hover:border-blue-300"
              } ${pkg.popular ? "lg:scale-105" : ""}`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.popular && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-center py-2 text-sm font-bold">
                  ⭐ MAIS POPULAR
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{pkg.credits}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      R$ {getDiscountedPrice(pkg).toFixed(2)}
                    </span>
                    {pkg.discount && (
                      <span className="text-lg text-gray-500 line-through">
                        R$ {pkg.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {pkg.discount && (
                    <div className="bg-red-50 text-red-700 text-sm font-semibold py-2 px-3 rounded mt-2">
                      💰 Economize R$ {getSavings(pkg).toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Price per Credit */}
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600">Preço por crédito</p>
                  <p className="text-lg font-bold text-gray-900">
                    R$ {getPricePerCredit(pkg).toFixed(2)}
                  </p>
                </div>

                {/* Select Button */}
                <Button
                  className={`w-full ${
                    selectedPackage === pkg.id
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                  }`}
                >
                  {selectedPackage === pkg.id ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Selecionado
                    </>
                  ) : (
                    "Selecionar"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checkout Section */}
        {selectedPackage && (
          <Card className="mb-8 border-2 border-blue-500">
            <CardHeader className="bg-blue-50">
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {(() => {
                const pkg = packages.find(p => p.id === selectedPackage);
                if (!pkg) return null;

                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-700">Pacote de {pkg.credits} Créditos</span>
                      <span className="font-semibold">R$ {getDiscountedPrice(pkg).toFixed(2)}</span>
                    </div>

                    {pkg.discount && (
                      <div className="flex justify-between items-center py-3 border-b text-green-600">
                        <span>Desconto ({pkg.discount}%)</span>
                        <span className="font-semibold">-R$ {getSavings(pkg).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-3 bg-gray-50 px-4 rounded-lg">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-2xl text-blue-600">
                        R$ {getDiscountedPrice(pkg).toFixed(2)}
                      </span>
                    </div>

                    <Button
                      onClick={handleBuyCredits}
                      disabled={isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {isProcessing ? "Processando..." : "Pagar com PayPal"}
                    </Button>

                    <p className="text-center text-sm text-gray-600">
                      🔒 Pagamento seguro via PayPal
                    </p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        <Card className="mb-8 bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Compre Créditos</h4>
                  <p className="text-gray-600 text-sm">Selecione um pacote e pague via PayPal</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Envie Alertas Personalizados</h4>
                  <p className="text-gray-600 text-sm">Use seus créditos para enviar mensagens customizadas</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Proprietário Recebe Notificação</h4>
                  <p className="text-gray-600 text-sm">Email, WhatsApp e push notification instantaneamente</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Perguntas Frequentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Quanto custa cada crédito?</h4>
              <p className="text-gray-600">Depende do pacote. Quanto maior o pacote, menor o preço por crédito.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Posso usar créditos para alertas fixos?</h4>
              <p className="text-gray-600">Não. Alertas fixos são sempre gratuitos. Créditos são apenas para mensagens personalizadas.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Quanto tempo leva para receber os créditos?</h4>
              <p className="text-gray-600">Instantaneamente após a confirmação do pagamento no PayPal.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Posso devolver créditos?</h4>
              <p className="text-gray-600">Não. Créditos são não-reembolsáveis. Use-os com sabedoria!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
