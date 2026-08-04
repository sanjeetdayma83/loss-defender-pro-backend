/// App environment — switch via --dart-define=ENV=dev|staging|prod
/// Example:
///   flutter run --dart-define=ENV=dev --dart-define=API_BASE_URL=http://192.168.1.109:3000/api
///   flutter run -d chrome --dart-define=ENV=dev --dart-define=API_BASE_URL=http://localhost:3000/api
class Environment {
  Environment._();

  static const String env = String.fromEnvironment('ENV', defaultValue: 'dev');

  /// Full API prefix including /api
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api',
  );

  static bool get isDev => env == 'dev';
  static bool get isStaging => env == 'staging';
  static bool get isProd => env == 'prod';
}
