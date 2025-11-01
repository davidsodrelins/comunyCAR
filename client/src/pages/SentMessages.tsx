import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Filter, Send, Trash2, Eye, Copy, CheckCircle, Clock, AlertCircle, Users } from "lucide-react";
import { useLocation } from "wouter";

interface SentMessage {
  id: number;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  alertType: string;
  message: string;
  timestamp: string;
  status: "delivered" | "pending" | "failed";
  recipientCount: number;
  creditsUsed: number;
  type: "fixed" | "personalized";
  reactions: Array<{ emoji: string; count: number; recipients: string[] }>;
  readBy: Array<{ name: string; email: string; readAt: string; reaction?: string }>;
}

export default function SentMessages() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "delivered" | "pending" | "failed">("all");
  const [selectedMessage, setSelectedMessage] = useState<SentMessage | null>(null);
  const [messages, setMessages] = useState<SentMessage[]>([
    {
      id: 1,
      vehiclePlate: "ABC-1234",
      vehicleBrand: "Toyota",
      vehicleModel: "Corolla",
      alertType: "Faróis Acesos",
      message: "O farol do seu veículo de placa ABC-1234 está aceso. Por favor, verifique.",
      timestamp: "2024-10-15 14:30",
      status: "delivered",
      recipientCount: 2,
      creditsUsed: 0,
      type: "fixed",
      reactions: [
        { emoji: "👍", count: 1, recipients: ["Maria Silva"] },
        { emoji: "✅", count: 1, recipients: ["Pedro Costa"] },
      ],
      readBy: [
        { name: "Maria Silva", email: "maria@example.com", readAt: "2024-10-15 14:31", reaction: "👍" },
        { name: "Pedro Costa", email: "pedro@example.com", readAt: "2024-10-15 14:32", reaction: "✅" },
      ],
    },
    {
      id: 2,
      vehiclePlate: "XYZ-5678",
      vehicleBrand: "Honda",
      vehicleModel: "Civic",
      alertType: "Personalizado",
      message: "Seu veículo está com a porta aberta na Rua das Flores, número 123.",
      timestamp: "2024-10-15 13:15",
      status: "delivered",
      recipientCount: 1,
      creditsUsed: 1,
      type: "personalized",
      reactions: [
        { emoji: "❤️", count: 1, recipients: ["João Silva"] },
      ],
      readBy: [
        { name: "João Silva", email: "joao@example.com", readAt: "2024-10-15 13:16", reaction: "❤️" },
      ],
    },
    {
      id: 3,
      vehiclePlate: "ABC-1234",
      vehicleBrand: "Toyota",
      vehicleModel: "Corolla",
      alertType: "Pneu Furado/Baixo",
      message: "Um dos pneus do seu veículo de placa ABC-1234 parece estar furado ou muito baixo.",
      timestamp: "2024-10-15 12:45",
      status: "pending",
      recipientCount: 2,
      creditsUsed: 0,
      type: "fixed",
      reactions: [],
      readBy: [],
    },
    {
      id: 4,
      vehiclePlate: "DEF-9012",
      vehicleBrand: "Volkswagen",
      vehicleModel: "Gól",
      alertType: "Personalizado",
      message: "Seu veículo foi estacionado em local proibido.",
      timestamp: "2024-10-15 11:20",
      status: "failed",
      recipientCount: 0,
      creditsUsed: 1,
      type: "personalized",
      reactions: [],
      readBy: [],
    },
  ]);

  const filteredMessages = messages.filter(msg => {
    const matchesSearch =
      msg.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || msg.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    setSelectedMessage(null);
  };

  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    alert("Mensagem copiada!");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    } else {
      return date.toLocaleDateString("pt-BR");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return "Entregue";
      case "pending":
        return "Pendente";
      case "failed":
        return "Falha";
      default:
        return status;
    }
  };

  const stats = {
    total: messages.length,
    delivered: messages.filter(m => m.status === "delivered").length,
    pending: messages.filter(m => m.status === "pending").length,
    failed: messages.filter(m => m.status === "failed").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">Mensagens Enviadas</h1>
            <p className="text-gray-600">Histórico de alertas que você enviou</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600 text-sm font-semibold mb-1">Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-green-600 text-sm font-semibold mb-1">Entregues</p>
              <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-yellow-600 text-sm font-semibold mb-1">Pendentes</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-600 text-sm font-semibold mb-1">Falhas</p>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por placa ou mensagem..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      onClick={() => setFilterStatus("all")}
                      size="sm"
                    >
                      Todas ({stats.total})
                    </Button>
                    <Button
                      variant={filterStatus === "delivered" ? "default" : "outline"}
                      onClick={() => setFilterStatus("delivered")}
                      size="sm"
                    >
                      Entregues ({stats.delivered})
                    </Button>
                    <Button
                      variant={filterStatus === "pending" ? "default" : "outline"}
                      onClick={() => setFilterStatus("pending")}
                      size="sm"
                    >
                      Pendentes ({stats.pending})
                    </Button>
                    <Button
                      variant={filterStatus === "failed" ? "default" : "outline"}
                      onClick={() => setFilterStatus("failed")}
                      size="sm"
                    >
                      Falhas ({stats.failed})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            {filteredMessages.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">Nenhuma mensagem encontrada</p>
                </CardContent>
              </Card>
            ) : (
              filteredMessages.map(message => (
                <Card
                  key={message.id}
                  className="cursor-pointer transition-all hover:shadow-md"
                  onClick={() => setSelectedMessage(message)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-bold text-gray-900">{message.vehiclePlate}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                              message.status
                            )}`}
                          >
                            {getStatusIcon(message.status)}
                            {getStatusLabel(message.status)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              message.type === "fixed"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {message.type === "fixed" ? "Fixo" : "Personalizado"}
                          </span>
                          {message.readBy.length > 0 && (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              👁 {message.readBy.length} visto(s)
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Veículo</p>
                            <p className="font-semibold text-gray-900">
                              {message.vehicleBrand} {message.vehicleModel}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Destinatários</p>
                            <p className="font-semibold text-gray-900">{message.recipientCount} pessoa(s)</p>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">{message.message}</p>

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="text-xs text-gray-500">{formatDate(message.timestamp)}</p>
                          {message.reactions.length > 0 && (
                            <div className="flex gap-1">
                              {message.reactions.map(r => (
                                <span key={r.emoji} className="text-sm">
                                  {r.emoji}
                                  {r.count > 1 && <span className="text-xs ml-0.5">{r.count}</span>}
                                </span>
                              ))}
                            </div>
                          )}
                          {message.creditsUsed > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {message.creditsUsed} crédito(s) usado(s)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMessage(message);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div>
            {selectedMessage ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes do Alerta</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Vehicle Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Veículo</p>
                    <p className="font-bold text-gray-900">{selectedMessage.vehiclePlate}</p>
                    <p className="text-sm text-gray-600">
                      {selectedMessage.vehicleBrand} {selectedMessage.vehicleModel}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-2">Status</p>
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                        selectedMessage.status
                      )}`}
                    >
                      {getStatusIcon(selectedMessage.status)}
                      {getStatusLabel(selectedMessage.status)}
                    </span>
                  </div>

                  {/* Alert Type */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Tipo de Alerta</p>
                    <p className="font-bold text-gray-900">{selectedMessage.alertType}</p>
                  </div>

                  {/* Message */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-2">Mensagem</p>
                    <p className="text-gray-900 text-sm mb-3">{selectedMessage.message}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleCopyMessage(selectedMessage.message)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Mensagem
                    </Button>
                  </div>

                  {/* Recipients */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Destinatários</p>
                    <p className="font-bold text-gray-900">{selectedMessage.recipientCount} pessoa(s)</p>
                  </div>

                  {/* Reactions Received */}
                  {selectedMessage.reactions.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-blue-600 uppercase mb-3">Reações Recebidas</p>
                      <div className="space-y-2">
                        {selectedMessage.reactions.map(reaction => (
                          <div key={reaction.emoji} className="flex items-center gap-2">
                            <span className="text-2xl">{reaction.emoji}</span>
                            <div>
                              <p className="text-sm font-semibold text-blue-900">{reaction.recipients.join(", ")}</p>
                              <p className="text-xs text-blue-700">{reaction.count} pessoa(s)</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Read By */}
                  {selectedMessage.readBy.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-xs text-green-600 uppercase mb-3">Visto por</p>
                      <div className="space-y-2">
                        {selectedMessage.readBy.map((reader, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-green-900">{reader.name}</p>
                              <p className="text-xs text-green-700">{reader.email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-green-700">{reader.readAt}</p>
                              {reader.reaction && <p className="text-lg">{reader.reaction}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Credits */}
                  {selectedMessage.creditsUsed > 0 && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-xs text-purple-600 uppercase mb-1">Créditos Utilizados</p>
                      <p className="font-bold text-purple-900">{selectedMessage.creditsUsed}</p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Data e Hora</p>
                    <p className="font-bold text-gray-900">{selectedMessage.timestamp}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(selectedMessage.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-4">
                <CardContent className="pt-12 pb-12 text-center">
                  <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Selecione uma mensagem para ver os detalhes</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
