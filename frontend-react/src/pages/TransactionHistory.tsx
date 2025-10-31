import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowUp, ArrowDown, Filter, Download, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

interface Transaction {
  id: string;
  type: "purchase" | "usage";
  description: string;
  amount: number;
  credits: number;
  balance: number;
  timestamp: string;
  status: "completed" | "pending" | "failed";
  paymentMethod?: string;
}

export default function TransactionHistory() {
  const [, setLocation] = useLocation();
  const [filterType, setFilterType] = useState<"all" | "purchase" | "usage">("all");

  const mockTransactions: Transaction[] = [
    {
      id: "1",
      type: "purchase",
      description: "Compra de 50 créditos",
      amount: 39.90,
      credits: 50,
      balance: 65,
      timestamp: "2024-10-15 14:30",
      status: "completed",
      paymentMethod: "PayPal"
    },
    {
      id: "2",
      type: "usage",
      description: "Alerta personalizado - Placa ABC-1234",
      amount: 0,
      credits: -1,
      balance: 15,
      timestamp: "2024-10-15 13:15",
      status: "completed"
    },
    {
      id: "3",
      type: "purchase",
      description: "Compra de 25 créditos",
      amount: 19.90,
      credits: 25,
      balance: 16,
      timestamp: "2024-10-14 18:45",
      status: "completed",
      paymentMethod: "PayPal"
    },
    {
      id: "4",
      type: "usage",
      description: "Alerta personalizado - Placa XYZ-5678",
      amount: 0,
      credits: -1,
      balance: -9,
      timestamp: "2024-10-14 16:20",
      status: "completed"
    },
    {
      id: "5",
      type: "usage",
      description: "Alerta personalizado - Placa DEF-9012",
      amount: 0,
      credits: -1,
      balance: -8,
      timestamp: "2024-10-14 15:00",
      status: "completed"
    },
    {
      id: "6",
      type: "purchase",
      description: "Compra de 10 créditos",
      amount: 9.90,
      credits: 10,
      balance: -7,
      timestamp: "2024-10-13 12:00",
      status: "completed",
      paymentMethod: "PayPal"
    }
  ];

  const filteredTransactions = mockTransactions.filter(t => 
    filterType === "all" || t.type === filterType
  );

  const totalSpent = mockTransactions
    .filter(t => t.type === "purchase")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCreditsUsed = Math.abs(
    mockTransactions
      .filter(t => t.type === "usage")
      .reduce((sum, t) => sum + t.credits, 0)
  );

  const getTypeIcon = (type: string) => {
    return type === "purchase" ? 
      <ArrowDown className="w-5 h-5 text-green-600" /> :
      <ArrowUp className="w-5 h-5 text-red-600" />;
  };

  const getTypeLabel = (type: string) => {
    return type === "purchase" ? "Compra" : "Uso";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluído";
      case "pending":
        return "Pendente";
      case "failed":
        return "Falhou";
      default:
        return status;
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Histórico de Transações</h1>
            <p className="text-gray-600">Acompanhe seus créditos e pagamentos</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 mb-2">Saldo Atual</p>
                  <p className="text-3xl font-bold">15 Créditos</p>
                </div>
                <TrendingUp className="w-12 h-12 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 mb-2">Total Gasto</p>
                  <p className="text-3xl font-bold">R$ {totalSpent.toFixed(2)}</p>
                </div>
                <ArrowDown className="w-12 h-12 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 mb-2">Créditos Usados</p>
                  <p className="text-3xl font-bold">{totalCreditsUsed}</p>
                </div>
                <ArrowUp className="w-12 h-12 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Todas
                </Button>
                <Button
                  variant={filterType === "purchase" ? "default" : "outline"}
                  onClick={() => setFilterType("purchase")}
                >
                  Compras
                </Button>
                <Button
                  variant={filterType === "usage" ? "default" : "outline"}
                  onClick={() => setFilterType("usage")}
                >
                  Uso
                </Button>
              </div>

              <Button
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-gray-500">Nenhuma transação encontrada</p>
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="pt-1">
                        {getTypeIcon(transaction.type)}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>📅 {transaction.timestamp}</span>
                          <span className={`font-semibold ${getStatusColor(transaction.status)}`}>
                            {getStatusLabel(transaction.status)}
                          </span>
                          {transaction.paymentMethod && (
                            <span>💳 {transaction.paymentMethod}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex flex-col items-end gap-2">
                        {transaction.type === "purchase" ? (
                          <>
                            <p className="text-lg font-bold text-green-600">
                              +{transaction.credits} créditos
                            </p>
                            <p className="text-sm text-gray-600">
                              R$ {transaction.amount.toFixed(2)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-bold text-red-600">
                              {transaction.credits} créditos
                            </p>
                            <p className="text-sm text-gray-600">
                              Saldo: {transaction.balance}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Info Box */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3">ℹ️ Sobre Créditos</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✅ Alertas fixos não consomem créditos</li>
              <li>✅ Cada alerta personalizado consome 1 crédito</li>
              <li>✅ Créditos não expiram</li>
              <li>✅ Você pode comprar créditos a qualquer momento</li>
              <li>✅ Reembolsos disponíveis em até 30 dias após a compra</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
