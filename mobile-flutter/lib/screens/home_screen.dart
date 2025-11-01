import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/alert_provider.dart';
import '../services/notification_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final alertProvider = context.read<AlertProvider>();
    await alertProvider.loadFixedAlerts();
    await alertProvider.loadReceivedAlerts();
    await alertProvider.loadSentAlerts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('comunyCAR'),
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.notifications),
            onPressed: () {
              // Mostrar notificações
            },
          ),
          IconButton(
            icon: Icon(Icons.person),
            onPressed: () {
              // Abrir perfil
            },
          ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.warning),
            label: 'Alertas',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.directions_car),
            label: 'Veículos',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Configurações',
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    switch (_selectedIndex) {
      case 0:
        return _buildHomeTab();
      case 1:
        return _buildAlertsTab();
      case 2:
        return _buildVehiclesTab();
      case 3:
        return _buildSettingsTab();
      default:
        return _buildHomeTab();
    }
  }

  Widget _buildHomeTab() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Bem-vindo!',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Receba alertas em tempo real sobre seus veículos',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
          ),
          SizedBox(height: 24),
          Text(
            'Ações Rápidas',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 12),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            children: [
              _buildActionCard(
                icon: Icons.warning,
                title: 'Enviar Alerta',
                color: Colors.orange,
                onTap: () {
                  // Navegar para envio de alerta
                },
              ),
              _buildActionCard(
                icon: Icons.directions_car,
                title: 'Meus Veículos',
                color: Colors.blue,
                onTap: () {
                  setState(() {
                    _selectedIndex = 2;
                  });
                },
              ),
              _buildActionCard(
                icon: Icons.notifications,
                title: 'Meus Alertas',
                color: Colors.red,
                onTap: () {
                  setState(() {
                    _selectedIndex = 1;
                  });
                },
              ),
              _buildActionCard(
                icon: Icons.settings,
                title: 'Configurações',
                color: Colors.grey,
                onTap: () {
                  setState(() {
                    _selectedIndex = 3;
                  });
                },
              ),
            ],
          ),
          SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () async {
              await NotificationService.sendTestNotification();
            },
            icon: Icon(Icons.volume_up),
            label: Text('Testar Som de Buzina'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              padding: EdgeInsets.symmetric(vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertsTab() {
    return Consumer<AlertProvider>(
      builder: (context, alertProvider, _) {
        if (alertProvider.isLoading) {
          return Center(child: CircularProgressIndicator());
        }

        if (alertProvider.receivedAlerts.isEmpty) {
          return Center(
            child: Text('Nenhum alerta recebido'),
          );
        }

        return ListView.builder(
          itemCount: alertProvider.receivedAlerts.length,
          itemBuilder: (context, index) {
            final alert = alertProvider.receivedAlerts[index];
            return Card(
              margin: EdgeInsets.all(8),
              child: ListTile(
                leading: Icon(Icons.warning, color: Colors.orange),
                title: Text(alert['message'] ?? 'Alerta'),
                subtitle: Text(alert['vehiclePlate'] ?? 'Placa desconhecida'),
                trailing: Icon(Icons.arrow_forward),
                onTap: () {
                  // Abrir detalhes do alerta
                },
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildVehiclesTab() {
    return Center(
      child: Text('Meus Veículos'),
    );
  }

  Widget _buildSettingsTab() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            child: ListTile(
              leading: Icon(Icons.notifications),
              title: Text('Notificações'),
              trailing: Icon(Icons.arrow_forward),
              onTap: () {
                // Abrir configurações de notificações
              },
            ),
          ),
          SizedBox(height: 8),
          Card(
            child: ListTile(
              leading: Icon(Icons.person),
              title: Text('Perfil'),
              trailing: Icon(Icons.arrow_forward),
              onTap: () {
                // Abrir perfil
              },
            ),
          ),
          SizedBox(height: 8),
          Card(
            child: ListTile(
              leading: Icon(Icons.help),
              title: Text('Ajuda'),
              trailing: Icon(Icons.arrow_forward),
              onTap: () {
                // Abrir ajuda
              },
            ),
          ),
          SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              context.read<AuthProvider>().logout();
              Navigator.of(context).pushReplacementNamed('/login');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: Text('Sair'),
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: color),
            SizedBox(height: 8),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
