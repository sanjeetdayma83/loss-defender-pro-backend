import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_endpoints.dart';

class ApiClient {
  static const _tokenKey = 'access_token';
  static const _refreshKey = 'refresh_token';

  static String? accessToken;
  static String? refreshToken;

  static final Dio dio = Dio(
    BaseOptions(
      baseUrl: ApiEndpoints.baseUrl,
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 12),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  static bool _interceptorAttached = false;

  /// Call once at app start (main.dart)
  static Future<void> init() async {
    if (!_interceptorAttached) {
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            if (accessToken != null && accessToken!.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $accessToken';
            }
            return handler.next(options);
          },
          onError: (e, handler) {
            return handler.next(e);
          },
        ),
      );
      _interceptorAttached = true;
    }

    final prefs = await SharedPreferences.getInstance();
    accessToken = prefs.getString(_tokenKey);
    refreshToken = prefs.getString(_refreshKey);
  }

  static Future<void> saveTokens({
    required String access,
    required String refresh,
  }) async {
    accessToken = access;
    refreshToken = refresh;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, access);
    await prefs.setString(_refreshKey, refresh);
  }

  static Future<void> clearTokens() async {
    accessToken = null;
    refreshToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_refreshKey);
  }

  static bool get isLoggedIn =>
      accessToken != null && accessToken!.isNotEmpty;
}
