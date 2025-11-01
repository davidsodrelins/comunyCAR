import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Filter, MessageCircle, Trash2, Archive, Eye, Smile } from "lucide-react";
import { useLocation } from "wouter";

interface Message {
  id: number;
  senderName: string;
  senderEmail: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  alertType: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: "fixed" | "personalized";
  reactions: Array<{ emoji: string; count: number; userReacted: boolean }>;
  readAt?: string;
}

const AVAILABLE_REACTIONS = [
  { emoji: "👍", label: "Visto" },
  { emoji: "❤️", label: "Obrigado" },
  { emoji: "⚠️", label: "Urgente" },
  { emoji: "✅", label: "Resolvido" },
  { emoji: "🚗", label: "Veículo" },
  { emoji: "⏰", label: "Depois" },
];

export default function ReceivedMessages() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "fixed" | "personalized">("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      senderName: "João Silva",
      senderEmail: "joao@example.com",
      vehiclePlate: "ABC-1234",
      vehicleBrand: "Toyota",
      vehicleModel: "Corolla",
      alertType: "Faróis Acesos",
      message: "O farol do seu veículo de placa ABC-1234 está aceso. Por favor, verifique.",
      timestamp: "2024-10-15 14:30",
      isRead: false,
      readAt: undefined,
      type: "fixed",
      reactions: [
        { emoji: "👍", count: 1, userReacted: false },
        { emoji: "✅", count: 1, userReacted: false },
      ],
    },
    {
      id: 2,
      senderName: "Maria Santos",
      senderEmail: "maria@example.com",
      vehiclePlate: "XYZ-5678",
      vehicleBrand: "Honda",
      vehicleModel: "Civic",
      alertType: "Personalizado",
      message: "Seu veículo está com a porta aberta na Rua das Flores, número 123.",
      timestamp: "2024-10-15 13:15",
      isRead: true,
      readAt: "2024-10-15 13:16",
      type: "personalized",
      reactions: [
        { emoji: "❤️", count: 1, userReacted: true },
      ],
    },
    {
      id: 3,
      senderName: "Pedro Costa",
      senderEmail: "pedro@example.com",
      vehiclePlate: "ABC-1234",
      vehicleBrand: "Toyota",
      vehicleModel: "Corolla",
      alertType: "Pneu Furado/Baixo",
      message: "Um dos pneus do seu veículo de placa ABC-1234 parece estar furado ou muito baixo.",
      timestamp: "2024-10-15 12:45",
      isRead: true,
      readAt: "2024-10-15 12:46",
      type: "fixed",
      reactions: [],
    },
  ]);

  const filteredMessages = messages.filter(msg => {
    const matchesSearch =
      msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" || msg.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const handleMarkAsRead = (id: number) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === id && !msg.isRead) {
          return { ...msg, isRead: true, readAt: new Date().toLocaleString("pt-BR") };
        }
        return msg;
      })
    );
  };

  const handleAddReaction = (messageId: number, emoji: string) => {
    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find(r => r.emoji === emoji);
          if (existingReaction) {
            if (existingReaction.userReacted) {
              // Remove reação
              return {
                ...msg,
                reactions: msg.reactions
                  .map(r => (r.emoji === emoji ? { ...r, count: r.count - 1, userReacted: false } : r))
                  .filter(r => r.count > 0),
              };
            } else {
              // Adicionar reação
              return {
                ...msg,
                reactions: msg.reactions.map(r =>
                  r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r
                ),
              };
            }
          } else {
            // Nova reação
            return {
              ...msg,
              reactions: [...msg.reactions, { emoji, count: 1, userReacted: true }],
            };
          }
        }
        return msg;
      })
    );
  };

  const handleDelete = (id: number) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    setSelectedMessage(null);
  };

  const handleArchive = (id: number) => {
    // Implementar lógica de arquivamento
    alert("Mensagem arquivada!");
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

  const unreadCount = messages.filter(m => !m.isRead).length;

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
            <h1 className="text-3xl font-bold text-gray-900">Mensagens Recebidas</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} mensagens não lidas` : "Todas as mensagens lidas"}
            </p>
          </div>
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
                      placeholder="Buscar por nome, placa ou mensagem..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={filterType === "all" ? "default" : "outline"}
                      onClick={() => setFilterType("all")}
                      className="flex-1"
                    >
                      Todas ({messages.length})
                    </Button>
                    <Button
                      variant={filterType === "fixed" ? "default" : "outline"}
                      onClick={() => setFilterType("fixed")}
                      className="flex-1"
                    >
                      Fixas ({messages.filter(m => m.type === "fixed").length})
                    </Button>
                    <Button
                      variant={filterType === "personalized" ? "default" : "outline"}
                      onClick={() => setFilterType("personalized")}
                      className="flex-1"
                    >
                      Personalizadas ({messages.filter(m => m.type === "personalized").length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            {filteredMessages.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">Nenhuma mensagem encontrada</p>
                </CardContent>
              </Card>
            ) : (
              filteredMessages.map(message => (
                <Card
                  key={message.id}
                  className={`cursor-pointer transition-all ${
                    !message.isRead ? "bg-blue-50 border-blue-200" : ""
                  } hover:shadow-md`}
                  onClick={() => {
                    setSelectedMessage(message);
                    handleMarkAsRead(message.id);
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900">{message.senderName}</h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              message.type === "fixed"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {message.type === "fixed" ? "Alerta Fixo" : "Personalizado"}
                          </span>
                          {!message.isRead && (
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Veículo</p>
                            <p className="font-semibold text-gray-900">
                              {message.vehiclePlate} - {message.vehicleBrand} {message.vehicleModel}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">Tipo de Alerta</p>
                            <p className="font-semibold text-gray-900">{message.alertType}</p>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-3 line-clamp-2">{message.message}</p>

                        <p className="text-xs text-gray-500">{formatDate(message.timestamp)}</p>
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

                      {/* Reactions Preview */}
                      {message.reactions.length > 0 && (
                        <div className="absolute bottom-2 right-2 flex gap-1 bg-white rounded-full px-2 py-1 shadow-sm">
                          {message.reactions.slice(0, 3).map(r => (
                            <span key={r.emoji} className="text-sm">
                              {r.emoji}
                              {r.count > 1 && <span className="text-xs ml-0.5">{r.count}</span>}
                            </span>
                          ))}
                          {message.reactions.length > 3 && (
                            <span className="text-xs text-gray-500">+{message.reactions.length - 3}</span>
                          )}
                        </div>
                      )}
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
                  <CardTitle className="text-lg">Detalhes da Mensagem</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Sender Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Remetente</p>
                    <p className="font-bold text-gray-900">{selectedMessage.senderName}</p>
                    <p className="text-sm text-gray-600">{selectedMessage.senderEmail}</p>
                  </div>

                  {/* Vehicle Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Veículo</p>
                    <p className="font-bold text-gray-900">{selectedMessage.vehiclePlate}</p>
                    <p className="text-sm text-gray-600">
                      {selectedMessage.vehicleBrand} {selectedMessage.vehicleModel}
                    </p>
                  </div>

                  {/* Alert Type */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Tipo de Alerta</p>
                    <p className="font-bold text-gray-900">{selectedMessage.alertType}</p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedMessage.type === "fixed"
                          ? "bg-green-100 text-green-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {selectedMessage.type === "fixed" ? "Alerta Fixo" : "Personalizado"}
                    </span>
                  </div>

                  {/* Message */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-2">Mensagem</p>
                    <p className="text-gray-900">{selectedMessage.message}</p>
                  </div>

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
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleArchive(selectedMessage.id)}
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Arquivar
                    </Button>
                  </div>

                  {/* Reactions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase mb-3">Reações</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedMessage.reactions.map(reaction => (
                        <button
                          key={reaction.emoji}
                          onClick={() => handleAddReaction(selectedMessage.id, reaction.emoji)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                            reaction.userReacted
                              ? "bg-blue-200 text-blue-900 ring-2 ring-blue-400"
                              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {reaction.emoji} {reaction.count}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {AVAILABLE_REACTIONS.map(r => {
                        const hasReaction = selectedMessage.reactions.find(x => x.emoji === r.emoji);
                        return !hasReaction ? (
                          <button
                            key={r.emoji}
                            onClick={() => handleAddReaction(selectedMessage.id, r.emoji)}
                            className="text-2xl hover:scale-125 transition-transform"
                            title={r.label}
                          >
                            {r.emoji}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Read Status */}
                  {selectedMessage.isRead && selectedMessage.readAt && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-xs text-green-600 uppercase mb-1">Visto em</p>
                      <p className="font-bold text-green-900">{selectedMessage.readAt}</p>
                    </div>
                  )}

                  {/* Reply Button */}
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Responder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-4">
                <CardContent className="pt-12 pb-12 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
