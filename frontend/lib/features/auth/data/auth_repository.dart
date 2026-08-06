import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_storage.dart';

/// Talks to POST /auth/login and /auth/register exactly per the backend contract.
class AuthRepository {
  final _dio = ApiClient.instance.dio;

  Future<void> login({required String email, required String password, String? deviceId}) async {
    final response = await _dio.post('/auth/login', data: {
      'email': email,
      'password': password,
      if (deviceId != null) 'deviceId': deviceId,
    });
    final data = response.data['data'];
    await SecureStorage.instance.saveTokens(
      accessToken: data['accessToken'],
      refreshToken: data['refreshToken'],
    );
  }

  Future<void> register({
    required String companyName,
    required String ownerName,
    required String email,
    required String password,
    required String phone,
  }) async {
    final response = await _dio.post('/auth/register', data: {
      'companyName': companyName,
      'ownerName': ownerName,
      'email': email,
      'password': password,
      'phone': phone,
    });
    final data = response.data['data'];
    await SecureStorage.instance.saveTokens(
      accessToken: data['accessToken'],
      refreshToken: data['refreshToken'],
    );
  }

  Future<void> logout() async {
    await SecureStorage.instance.clear();
  }
}
