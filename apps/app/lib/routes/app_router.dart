import 'package:go_router/go_router.dart';

import '../features/authentication/presentation/pages/login_page.dart';
import '../features/dashboard/presentation/pages/dashboard_page.dart';
import '../features/orders/presentation/pages/orders_page.dart';
import '../features/scanner/presentation/pages/scanner_page.dart';
import '../features/recording/presentation/pages/recording_page.dart';
import '../features/evidence/presentation/pages/evidence_page.dart';

class AppRouter {
  AppRouter._();

  static final GoRouter router = GoRouter(
    initialLocation: '/login',

    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginPage()),

      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardPage(),
      ),

      GoRoute(path: '/orders', builder: (context, state) => const OrdersPage()),

      GoRoute(
        path: '/scanner',
        builder: (context, state) =>
            const ScannerPage(orderId: "TEST_ORDER_001"),
      ),

      GoRoute(
        path: '/recording',
        builder: (context, state) =>
            const RecordingPage(orderId: "TEST_ORDER_001"),
      ),

      GoRoute(
        path: '/evidence',
        builder: (context, state) =>
            const EvidencePage(orderId: "TEST_ORDER_001"),
      ),
    ],
  );
}
