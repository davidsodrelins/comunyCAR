import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, CheckCircle, Clock, Filter, Download } from "lucide-react";
import { useLocation } from "wouter";

interface Alert {
  id: string;
  vehiclePlate: string;
  alertType: string;
  message: string;
  status: "sent" | "delivered" | "read";
  timestamp: string;
  recipients: number;
}

export default function AlertHistory() {
  const [, setLocation] = useLocation();
  const [filterType, setFilterType] = useState<"all" | "sent" | "delivered" | "read">("all");
  const [searchPlate, setSearchPlate] = useState("");

  const mockAlerts: Alert[] = [
    {
      id: "1",
      vehiclePlate: "ABC-1234",
      alertType: "Faróis Acesos",
      message: "O farol do seu veículo está aceso",
      status: "read",
      timestamp: "2024-10-15 14:30",
      recipients: 2
    },
    {
      id: "2",
      vehiclePlate: "XYZ-5678",
      alertType: "Pneu Furado",
      message: "Um dos pneus parece estar furado",
      status: "delivered",
      timestamp: "2024-10-15 13:15",
      recipients: 1
    },
    {
      id: "3",
      vehiclePlate: "DEF-9012",
      alertType: "Porta Aberta",
      message: "A porta do seu veículo está aberta",
      status: "sent",
      timestamp: "2024-10-15 12:00",
      recipients: 3
    },
    {
      id: "4",
      vehiclePlate: "ABC-1234",
      alertType: "Alarme Disparado",
      message: "O alarme do seu veículo está disparado",
      status: "read",
      timestamp: "2024-10-14 18:45",
      recipients: 2
    },
    {
      id: "5",
      vehiclePlate: "GHI-3456",
      alertType: "Vazamento de Fluido",
      message: "Há vazamento de óleo sob o seu veículo",
      status: "delivered",
      timestamp: "2024-10-14 16:20",
      recipients: 1
    }
  ];

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesFilter = filterType === "all" || alert.status === filterType;
    const matchesSearch = alert.vehiclePlate.includes(searchPlate.toUpperCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Clock className="w-4 h-4" />;
      case "delivered":
        return <AlertCircle className="w-4 h-4" />;
      case "read":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "sent":
        return "Enviado";
      case "delivered":
        return "Entregue";
      case "read":
        return "Lido";
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
            <h1 className="text-3xl font-bold text-gray-900">Histórico de Alertas</h1>
            <p className="text-gray-600">Veja todos os alertas que você enviou</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por placa (ex: ABC-1234)"
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  onClick={() => setFilterType("all")}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Todos
                </Button>
                <Button
                  variant={filterType === "sent" ? "default" : "outline"}
                  onClick={() => setFilterType("sent")}
                >
                  Enviados
                </Button>
                <Button
                  variant={filterType === "delivered" ? "default" : "outline"}
                  onClick={() => setFilterType("delivered")}
                >
                  Entregues
                </Button>
                <Button
                  variant={filterType === "read" ? "default" : "outline"}
                  onClick={() => setFilterType("read")}
                >
                  Lidos
                </Button>
              </div>

              {/* Export */}
              <Button
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 text-sm mb-2">Total de Alertas</p>
              <p className="text-3xl font-bold text-blue-600">{mockAlerts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 text-sm mb-2">Enviados</p>
              <p className="text-3xl font-bold text-yellow-600">
                {mockAlerts.filter(a => a.status === "sent").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 text-sm mb-2">Entregues</p>
              <p className="text-3xl font-bold text-blue-600">
                {mockAlerts.filter(a => a.status === "delivered").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 text-sm mb-2">Lidos</p>
              <p className="text-3xl font-bold text-green-600">
                {mockAlerts.filter(a => a.status === "read").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum alerta encontrado</h3>
                <p className="text-gray-500">Tente ajustar seus filtros de busca</p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{alert.vehiclePlate}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusColor(alert.status)}`}>
                          {getStatusIcon(alert.status)}
                          {getStatusLabel(alert.status)}
                        </span>
                      </div>

                      <div className="mb-3">
                        <p className="font-semibold text-gray-900">{alert.alertType}</p>
                        <p className="text-gray-600">{alert.message}</p>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>📅 {alert.timestamp}</span>
                        <span>👥 {alert.recipients} {alert.recipients === 1 ? "destinatário" : "destinatários"}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        Detalhes
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                        Remover
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredAlerts.length > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button variant="outline" disabled>← Anterior</Button>
            <Button variant="default">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Próximo →</Button>
          </div>
        )}
      </div>
    </div>
  );
}
