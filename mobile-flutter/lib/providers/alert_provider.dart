import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AlertProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  bool _isLoading = false;
  String? _error;
  List<Map<String, dynamic>> _fixedAlerts = [];
  List<Map<String, dynamic>> _receivedAlerts = [];
  List<Map<String, dynamic>> _sentAlerts = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Map<String, dynamic>> get fixedAlerts => _fixedAlerts;
  List<Map<String, dynamic>> get receivedAlerts => _receivedAlerts;
  List<Map<String, dynamic>> get sentAlerts => _sentAlerts;

  Future<void> loadFixedAlerts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _fixedAlerts = await _apiService.getFixedAlerts();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> sendFixedAlert({
    required String vehiclePlate,
    required int alertTypeId,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.sendFixedAlert(
        vehiclePlate: vehiclePlate,
        alertTypeId: alertTypeId,
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> sendPersonalizedAlert({
    required String vehiclePlate,
    required String message,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.sendPersonalizedAlert(
        vehiclePlate: vehiclePlate,
        message: message,
      );
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadReceivedAlerts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _receivedAlerts = await _apiService.getReceivedAlerts();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadSentAlerts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _sentAlerts = await _apiService.getSentAlerts();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
