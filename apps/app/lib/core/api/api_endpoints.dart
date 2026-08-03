class ApiEndpoints {
  ApiEndpoints._();

  /// ============================================
  /// Base URL
  /// ============================================

  /// Chrome
  static const String baseUrl = 'http://localhost:3000/api';

  /// Android Emulator
  // static const String baseUrl = 'http://10.0.2.2:3000/api';

  /// Real Device
  // static const String baseUrl = 'http://192.168.1.100:3000/api';

  /// ============================================
  /// Authentication
  /// ============================================

  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String profile = '/auth/profile';

  /// ============================================
  /// Companies
  /// ============================================

  static const String companies = '/companies';

  /// ============================================
  /// Users
  /// ============================================

  static const String users = '/users';

  /// ============================================
  /// Warehouses
  /// ============================================

  static const String warehouses = '/warehouses';

  /// ============================================
  /// Orders
  /// ============================================

  static const String orders = '/orders';
  static const String ordersDashboard = '/orders/dashboard';
  static const String ordersStatistics = '/orders/statistics';
  static const String analyticsMarketplace = '/orders/analytics/marketplace';
  static const String analyticsWarehouse = '/orders/analytics/warehouse';
  static const String analyticsPriority = '/orders/analytics/priority';
  static const String analyticsStatus = '/orders/analytics/status';
  static const String analyticsDailyTrend = '/orders/analytics/daily-trend';

  /// ============================================
  /// Recording
  /// ============================================

  static const String recordings = '/recordings';

  /// ============================================
  /// Scanner
  /// (backend controller is @Controller('scanner'), not 'scans')
  /// ============================================

  static const String scans = '/scanner';

  /// ============================================
  /// Evidence
  /// ============================================

  static const String evidence = '/evidence';

  /// ============================================
  /// Claims
  /// ============================================

  static const String claims = '/claims';

  /// ============================================
  /// Returns
  /// ============================================

  static const String returns = '/returns';
}
