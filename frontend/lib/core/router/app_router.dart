import 'package:go_router/go_router.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/orders/presentation/orders_screen.dart';
import '../../features/scanner/presentation/scanner_screen.dart';
import '../../features/recording/presentation/recording_screen.dart';
import '../../features/evidence/presentation/evidence_screen.dart';
import '../../features/claims/presentation/claims_screen.dart';
import '../../features/returns/presentation/returns_screen.dart';

/// Screen list matches SRS section on Flutter Mobile/Desktop Screens.
final appRouter = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(path: '/register', builder: (context, state) => const RegisterScreen()),
    GoRoute(path: '/dashboard', builder: (context, state) => const DashboardScreen()),
    GoRoute(path: '/orders', builder: (context, state) => const OrdersScreen()),
    GoRoute(path: '/scanner', builder: (context, state) => const ScannerScreen()),
    GoRoute(path: '/recording', builder: (context, state) => const RecordingScreen()),
    GoRoute(path: '/evidence', builder: (context, state) => const EvidenceScreen()),
    GoRoute(path: '/claims', builder: (context, state) => const ClaimsScreen()),
    GoRoute(path: '/returns', builder: (context, state) => const ReturnsScreen()),
  ],
);
