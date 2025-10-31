import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Car, Plus, Trash2, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function Vehicles() {
  const [, setLocation] = useLocation();
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      plate: "ABC-1234",
      brand: "Toyota",
      model: "Corolla",
      color: "Prata",
      year: 2022,
      users: [
        { id: 1, name: "Maria Silva", role: "owner" },
        { id: 2, name: "Pedro Silva", role: "secondary" }
      ]
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate: "",
    brand: "",
    model: "",
    color: "",
    year: new Date().getFullYear()
  });

  const handleAddVehicle = () => {
    if (!newVehicle.plate || !newVehicle.brand || !newVehicle.model) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const vehicle = {
      id: vehicles.length + 1,
      ...newVehicle,
      users: [{ id: 1, name: "Você", role: "owner" }]
    };

    setVehicles([...vehicles, vehicle]);
    setNewVehicle({ plate: "", brand: "", model: "", color: "", year: new Date().getFullYear() });
    setShowAddForm(false);
  };

  const handleDeleteVehicle = (id: number) => {
    if (confirm("Tem certeza que deseja remover este veículo?")) {
      setVehicles(vehicles.filter(v => v.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="hover:bg-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Veículos</h1>
              <p className="text-gray-600">Gerencie seus veículos e usuários</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Veículo
          </Button>
        </div>

        {/* Add Vehicle Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Adicionar Novo Veículo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Placa (ABC-1234)"
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value.toUpperCase() })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Marca (ex: Toyota)"
                  value={newVehicle.brand}
                  onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Modelo (ex: Corolla)"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Cor (ex: Prata)"
                  value={newVehicle.color}
                  onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Ano"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4 mt-4">
                <Button
                  onClick={handleAddVehicle}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Salvar Veículo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vehicles List */}
        {vehicles.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum veículo cadastrado</h3>
              <p className="text-gray-500 mb-4">Adicione seu primeiro veículo para começar</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar Veículo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Car className="w-6 h-6 text-blue-600" />
                        <h3 className="text-2xl font-bold text-gray-900">{vehicle.plate}</h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Marca</p>
                          <p className="font-semibold text-gray-900">{vehicle.brand}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Modelo</p>
                          <p className="font-semibold text-gray-900">{vehicle.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Cor</p>
                          <p className="font-semibold text-gray-900">{vehicle.color}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Ano</p>
                          <p className="font-semibold text-gray-900">{vehicle.year}</p>
                        </div>
                      </div>

                      {/* Users */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Usuários ({vehicle.users.length})
                        </h4>
                        <div className="space-y-2">
                          {vehicle.users.map((user) => (
                            <div key={user.id} className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-600 capitalize">
                                  {user.role === "owner" ? "Proprietário" : "Usuário Secundário"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Usuário
                        </Button>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      className="text-red-600 hover:bg-red-50 ml-4"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Box */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-3">ℹ️ Sobre Seus Veículos</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✅ Você é o proprietário (owner) de todos os seus veículos</li>
              <li>✅ Pode adicionar usuários secundários (cônjuge, filhos, etc)</li>
              <li>✅ Todos os usuários receberão alertas sobre o veículo</li>
              <li>✅ Pode remover usuários a qualquer momento</li>
              <li>✅ Pode remover veículos da sua conta</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
