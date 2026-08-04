import 'package:dio/dio.dart';
import '../storage/token_storage.dart';
import 'api_endpoints.dart';

class ApiClient {
  static String? accessToken;
  static String? refreshToken;
  static bool _interceptorAttached = false;
  static bool _refreshing = false;

  static final Dio dio = Dio(
    BaseOptions(
      baseUrl: ApiEndpoints.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 20),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  /// Call once at app start (main.dart)
  static Future<void> init() async {
    // baseUrl may change via dart-define — keep Dio in sync
    dio.options.baseUrl = ApiEndpoints.baseUrl;

    if (!_interceptorAttached) {
      dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            if (accessToken != null && accessToken!.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $accessToken';
            }
            return handler.next(options);
          },
          onError: (error, handler) async {
            final status = error.response?.statusCode;
            final path = error.requestOptions.path;

            // Don't try refresh on auth endpoints themselves
            final isAuthCall = path.contains('/auth/login') ||
                path.contains('/auth/refresh') ||
                path.contains('/auth/logout');

            if (status == 401 && !isAuthCall) {
              final ok = await _tryRefresh();
              if (ok) {
                try {
                  final req = error.requestOptions;
                  req.headers['Authorization'] = 'Bearer $accessToken';
                  final clone = await dio.fetch(req);
                  return handler.resolve(clone);
                } catch (e) {
                  return handler.next(error);
                }
              }
              await clearTokens();
            }
            return handler.next(error);
          },
        ),
      );
      _interceptorAttached = true;
    }

    accessToken = await TokenStorage.accessToken();
    refreshToken = await TokenStorage.refreshToken();
  }

  static Future<bool> _tryRefresh() async {
    if (_refreshing) return false;
    if (refreshToken == null || refreshToken!.isEmpty) return false;

    _refreshing = true;
    try {
      // Use a bare Dio to avoid interceptor recursion
      final bare = Dio(
        BaseOptions(
          baseUrl: ApiEndpoints.baseUrl,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        ),
      );
      final res = await bare.post(
        ApiEndpoints.refresh,
        data: {'refreshToken': refreshToken},
      );

      final data = res.data is Map ? Map<String, dynamic>.from(res.data as Map) : <String, dynamic>{};
      final body = data['data'] is Map
          ? Map<String, dynamic>.from(data['data'] as Map)
          : data;

      final newAccess = (body['accessToken'] ?? body['access_token'])?.toString();
      final newRefresh = (body['refreshToken'] ?? body['refresh_token'])?.toString() ?? refreshToken;

      if (newAccess == null || newAccess.isEmpty) return false;

      await saveTokens(access: newAccess, refresh: newRefresh ?? '');
      return true;
    } catch (_) {
      return false;
    } finally {
      _refreshing = false;
    }
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
