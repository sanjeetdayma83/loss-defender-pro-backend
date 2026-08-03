import 'package:dio/dio.dart';
import '../storage/token_storage.dart';
import 'api_endpoints.dart';

class ApiClient {
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

    accessToken = await TokenStorage.accessToken();
    refreshToken = await TokenStorage.refreshToken();
  }

  static Future<void> saveTokens({
    required String access,
    required String refresh,
  }) async {
    accessToken = access;
    refreshToken = refresh;
    await TokenStorage.save(accessToken: access, refreshToken: refresh);
  }

  static Future<void> clearTokens() async {
    accessToken = null;
    refreshToken = null;
    await TokenStorage.clear();
  }

  static bool get isLoggedIn =>
      accessToken != null && accessToken!.isNotEmpty;
}
