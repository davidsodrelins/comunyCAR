import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'https://comunicar.hidalgo.digital/api/v1';
  
  late Dio _dio;
  late SharedPreferences _prefs;

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
        },
      ),
    );

    // Adicionar interceptor para token
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            // Token expirou, fazer logout
            logout();
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<void> initialize() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // ==================== AUTH ====================

  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String phone,
    required String cnpj,
    required String password,
    required String confirmPassword,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/register',
        data: {
          'name': name,
          'email': email,
          'phone': phone,
          'cnpj': cnpj,
          'password': password,
          'confirmPassword': confirmPassword,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );
      
      // Salvar token
      if (response.data['token'] != null) {
        await _prefs.setString('token', response.data['token']);
      }
      
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> verifyEmail({required String token}) async {
    try {
      final response = await _dio.post(
        '/auth/verify-email',
        data: {'token': token},
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> forgotPassword({required String email}) async {
    try {
      final response = await _dio.post(
        '/auth/forgot-password',
        data: {'email': email},
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> resetPassword({
    required String token,
    required String password,
    required String confirmPassword,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/reset-password',
        data: {
          'token': token,
          'password': password,
          'confirmPassword': confirmPassword,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  // ==================== ALERTS ====================

  Future<List<Map<String, dynamic>>> getFixedAlerts() async {
    try {
      final response = await _dio.get('/alerts/fixed');
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> sendFixedAlert({
    required String vehiclePlate,
    required int alertTypeId,
  }) async {
    try {
      final response = await _dio.post(
        '/alerts/send-fixed',
        data: {
          'vehiclePlate': vehiclePlate,
          'alertTypeId': alertTypeId,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> sendPersonalizedAlert({
    required String vehiclePlate,
    required String message,
  }) async {
    try {
      final response = await _dio.post(
        '/alerts/send-personalized',
        data: {
          'vehiclePlate': vehiclePlate,
          'message': message,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getReceivedAlerts() async {
    try {
      final response = await _dio.get('/alerts/received');
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<List<Map<String, dynamic>>> getSentAlerts() async {
    try {
      final response = await _dio.get('/alerts/sent');
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      rethrow;
    }
  }

  // ==================== VEHICLES ====================

  Future<List<Map<String, dynamic>>> getVehicles() async {
    try {
      final response = await _dio.get('/vehicles');
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> createVehicle({
    required String plate,
    required String brand,
    required String model,
    required String color,
  }) async {
    try {
      final response = await _dio.post(
        '/vehicles/create',
        data: {
          'plate': plate,
          'brand': brand,
          'model': model,
          'color': color,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  // ==================== CREDITS ====================

  Future<Map<String, dynamic>> getCredits() async {
    try {
      final response = await _dio.get('/credits/balance');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> purchaseCredits({
    required int amount,
    required String paymentMethod,
  }) async {
    try {
      final response = await _dio.post(
        '/credits/purchase',
        data: {
          'amount': amount,
          'paymentMethod': paymentMethod,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  // ==================== NOTIFICATIONS ====================

  Future<Map<String, dynamic>> getNotificationPreferences() async {
    try {
      final response = await _dio.get('/notifications/preferences');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> updateNotificationPreferences({
    required bool emailEnabled,
    required bool whatsappEnabled,
    required bool pushEnabled,
    required bool soundEnabled,
  }) async {
    try {
      final response = await _dio.post(
        '/notifications/update-preferences',
        data: {
          'emailEnabled': emailEnabled,
          'whatsappEnabled': whatsappEnabled,
          'pushEnabled': pushEnabled,
          'soundEnabled': soundEnabled,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> registerPushToken({
    required String token,
    required String platform,
  }) async {
    try {
      final response = await _dio.post(
        '/notifications/register-push-token',
        data: {
          'token': token,
          'platform': platform,
        },
      );
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  // ==================== UTILITY ====================

  Future<String?> getToken() async {
    return _prefs.getString('token');
  }

  Future<void> saveToken(String token) async {
    await _prefs.setString('token', token);
  }

  Future<void> logout() async {
    await _prefs.remove('token');
  }

  bool isAuthenticated() {
    return _prefs.containsKey('token');
  }
}
