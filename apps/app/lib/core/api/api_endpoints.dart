import 'package:flutter/foundation.dart';

class ApiEndpoints {
  /// ==========================================================
  /// ENVIRONMENT
  /// false = Local Development
  /// true  = Production Server
  /// ==========================================================
  static const bool isProduction = false;

  /// ==========================================================
  /// BASE URL
  /// ==========================================================
  static String get baseUrl {
    if (isProduction) {
      // Future Production API
      return 'https://api.lossdefender.in/api';
    }

    // Local Development
    if (kIsWeb) {
      // Flutter Web
      return 'http://localhost:3000/api';
    }

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        // Android Emulator
        return 'http://10.0.2.2:3000/api';

      case TargetPlatform.windows:
      case TargetPlatform.linux:
      case TargetPlatform.macOS:
        // Desktop
        return 'http://localhost:3000/api';

      case TargetPlatform.iOS:
        // iOS Simulator
        return 'http://localhost:3000/api';

      default:
        return 'http://localhost:3000/api';
    }
  }

  // ==========================================================
  // AUTH
  // ==========================================================

  static const String login = '/auth/login';
  static const String profile = '/auth/profile';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';

  // ==========================================================
  // DASHBOARD
  // ==========================================================

  static const String dashboard = '/dashboard';
  static const String ordersDashboard = '/orders/dashboard';

  // ==========================================================
  // ANALYTICS
  // ==========================================================

  static const String analyticsMarketplace = '/analytics/marketplace';

  static const String analyticsStatus = '/analytics/status';

  // ==========================================================
  // MASTER DATA
  // ==========================================================

  static const String users = '/users';
  static const String companies = '/companies';
  static const String warehouses = '/warehouses';

  // ==========================================================
  // ORDERS
  // ==========================================================

  static const String orders = '/orders';

  // ==========================================================
  // RECORDINGS
  // ==========================================================

  static const String recordings = '/recordings';
  static const String upload = '/upload';

  // ==========================================================
  // SCANNER
  // ==========================================================

  static const String scans = '/scans';
}
