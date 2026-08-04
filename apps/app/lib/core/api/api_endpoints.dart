class ApiEndpoints {
  // Toggle this to TRUE jab app ka release build banana ho (Play Store / Excloud)
  static const bool isProduction = false;
  
  // Production URL vs Localhost (10.0.2.2 is for Android Emulator)
  static const String baseUrl = isProduction 
      ? 'http://api.lossdefender.in' // Server live hone ke baad isko https karenge
      : 'http://10.0.2.2:3000'; 

  // Core Endpoints
  static const String login = '/auth/login';
  static const String dashboard = '/dashboard';
  static const String users = '/users';
  static const String upload = '/upload';
  static const String companies = '/companies';
  static const String warehouses = '/warehouses';
  static const String orders = '/orders';
}
