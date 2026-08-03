import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/presentation/pages/login_page.dart';
import '../features/dashboard/presentation/pages/dashboard_page.dart';
import '../features/orders/presentation/pages/orders_page.dart';
import '../features/scanner/presentation/pages/scanning_dashboard_page.dart';
import '../features/recording/presentation/pages/recording_page.dart';
import '../features/subscription/presentation/pages/plans_page.dart';
import '../features/settings/presentation/pages/settings_page.dart';
import '../features/alerts/presentation/pages/alerts_page.dart';
import '../features/users/presentation/pages/users_page.dart';
import '../features/returns/presentation/pages/returns_page.dart';
import '../features/profile/presentation/pages/profile_page.dart';
import '../features/analytics/presentation/pages/analytics_page.dart';

class PlaceholderPage extends StatelessWidget {
  final String title;
  const PlaceholderPage({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text("$title - Coming Soon", style: const TextStyle(fontSize: 24))),
    );
  }
}

class AppRouter {
  static final router = GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardPage(),
      ),
      GoRoute(
        path: '/orders',
        builder: (context, state) => const OrdersPage(),
      ),
      GoRoute(
        path: '/scanning',
        builder: (context, state) => const ScanningDashboardPage(),
      ),
      GoRoute(
        path: '/recording',
        builder: (context, state) {
          final orderId = state.uri.queryParameters['orderId'];
          final autostart = state.uri.queryParameters['autostart'] == '1';
          return RecordingPage(orderId: orderId, autostart: autostart);
        },
      ),
      GoRoute(
        path: '/plans',
        builder: (context, state) => const PlansPage(),
      ),
      GoRoute(
        path: '/analytics',
        builder: (context, state) => const AnalyticsPage(),
      ),
      GoRoute(
        path: '/alerts',
        builder: (context, state) => const AlertsPage(),
      ),
      GoRoute(
        path: '/users',
        builder: (context, state) => const UsersPage(),
      ),
      GoRoute(
        path: '/returns',
        builder: (context, state) => const ReturnsPage(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsPage(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfilePage(),
      ),
    ],
  );
}

