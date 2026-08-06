import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../widgets/app_shell.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/orders/presentation/orders_screen.dart';
import '../../features/scanner/presentation/scanner_screen.dart';
import '../../features/recording/presentation/recording_screen.dart';
import '../../features/evidence/presentation/evidence_screen.dart';
import '../../features/claims/presentation/claims_screen.dart';
import '../../features/returns/presentation/returns_screen.dart';
import '../../features/warehouses/presentation/warehouses_screen.dart';
import '../../features/dispatch/presentation/dispatch_screen.dart';
import '../../features/analytics/presentation/analytics_screen.dart';
import '../../features/users/presentation/users_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';
import '../../features/alerts/presentation/alerts_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
    ShellRoute(
      builder: (context, state, child) {
        return AppShell(currentPath: state.uri.path, child: child);
      },
      routes: [
        GoRoute(path: '/dashboard', builder: (context, state) => const DashboardScreen()),
        GoRoute(path: '/orders', builder: (context, state) => const OrdersScreen()),
        GoRoute(
          path: '/scanner',
          builder: (context, state) {
            final orderId = state.uri.queryParameters['orderId'];
            return ScannerScreen(orderId: orderId);
          },
        ),
        GoRoute(path: '/recording', builder: (context, state) => const RecordingScreen()),
        GoRoute(path: '/evidence', builder: (context, state) => const EvidenceScreen()),
        GoRoute(path: '/dispatch', builder: (context, state) => const DispatchScreen()),
        GoRoute(path: '/returns', builder: (context, state) => const ReturnsScreen()),
        GoRoute(path: '/claims', builder: (context, state) => const ClaimsScreen()),
        GoRoute(path: '/analytics', builder: (context, state) => const AnalyticsScreen()),
        GoRoute(path: '/alerts', builder: (context, state) => const AlertsScreen()),
        GoRoute(path: '/users', builder: (context, state) => const UsersScreen()),
        GoRoute(path: '/warehouses', builder: (context, state) => const WarehousesScreen()),
        GoRoute(path: '/marketplace', builder: (context, state) => const _Placeholder('Marketplace')),
        GoRoute(path: '/settings', builder: (context, state) => const SettingsScreen()),
      ],
    ),
  ],
);

class _Placeholder extends StatelessWidget {
  final String title;
  const _Placeholder(this.title);
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text('$title — UI next', style: const TextStyle(fontSize: 16, color: Colors.grey)),
    );
  }
}