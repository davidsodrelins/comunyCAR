import 'package:flutter/material.dart';
import '../services/api_service.dart';

class NotificationProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  bool _isLoading = false;
  String? _error;
  Map<String, dynamic>? _preferences;
  bool _emailEnabled = true;
  bool _whatsappEnabled = true;
  bool _pushEnabled = true;
  bool _soundEnabled = true;

  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, dynamic>? get preferences => _preferences;
  bool get emailEnabled => _emailEnabled;
  bool get whatsappEnabled => _whatsappEnabled;
  bool get pushEnabled => _pushEnabled;
  bool get soundEnabled => _soundEnabled;

  Future<void> loadPreferences() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _preferences = await _apiService.getNotificationPreferences();
      _emailEnabled = _preferences?['emailEnabled'] ?? true;
      _whatsappEnabled = _preferences?['whatsappEnabled'] ?? true;
      _pushEnabled = _preferences?['pushEnabled'] ?? true;
      _soundEnabled = _preferences?['soundEnabled'] ?? true;
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> updatePreferences({
    required bool emailEnabled,
    required bool whatsappEnabled,
    required bool pushEnabled,
    required bool soundEnabled,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.updateNotificationPreferences(
        emailEnabled: emailEnabled,
        whatsappEnabled: whatsappEnabled,
        pushEnabled: pushEnabled,
        soundEnabled: soundEnabled,
      );
      
      _emailEnabled = emailEnabled;
      _whatsappEnabled = whatsappEnabled;
      _pushEnabled = pushEnabled;
      _soundEnabled = soundEnabled;
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

  Future<bool> registerPushToken({
    required String token,
    required String platform,
  }) async {
    try {
      await _apiService.registerPushToken(
        token: token,
        platform: platform,
      );
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
