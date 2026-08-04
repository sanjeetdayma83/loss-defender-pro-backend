import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';

class Sidebar extends StatefulWidget {
  final bool isDrawer;

  const Sidebar({super.key, this.isDrawer = false});

  @override
  State<Sidebar> createState() => _SidebarState();
}

class _SidebarState extends State<Sidebar> {
  String? alertsBadge; // null = no badge

  @override
  void initState() {
    super.initState();
    _loadAlertsCount();
  }

  Future<void> _loadAlertsCount() async {
    try {
      final response = await ApiClient.dio.get(ApiEndpoints.alerts);
      final body = response.data;
      int openCount = 0;

      if (body is Map) {
        final data = body['data'];
        if (data is Map) {
          // Prefer open count from API summary
          if (data['open'] is num) {
            openCount = (data['open'] as num).toInt();
          } else if (data['items'] is List) {
            final items = data['items'] as List;
            openCount = items.where((e) {
              if (e is! Map) return false;
              final status = (e['status'] ?? 'Open').toString().toLowerCase();
              return status != 'closed' && status != 'resolved';
            }).length;
          }
        } else if (data is List) {
          openCount = data.where((e) {
            if (e is! Map) return false;
            final status = (e['status'] ?? 'Open').toString().toLowerCase();
            return status != 'closed' && status != 'resolved';
          }).length;
        }
      }

      if (mounted) {
        setState(() {
          // Show badge only when there are open alerts
          alertsBadge = openCount > 0 ? openCount.toString() : null;
        });
      }
    } catch (_) {
      // On error keep badge null (no fake number)
      if (mounted) setState(() => alertsBadge = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeRoute = GoRouterState.of(context).uri.path;

    final content = SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Logo + brand
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 18, 16, 12),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.asset(
                    'assets/logos/logo.png',
                    width: 36,
                    height: 36,
                    fit: BoxFit.contain,
                    errorBuilder: (_, _, _) => Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.blue.shade600,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.shield, color: Colors.white, size: 20),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                const Flexible(
                  child: Text(
                    'Loss Defender Pro',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: Color(0xFF1E2329),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: Colors.grey.shade200),

          // Nav items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: [
                _item(context, Icons.home_outlined, Icons.home, 'Dashboard', '/dashboard', activeRoute),
                _item(context, Icons.inventory_2_outlined, Icons.inventory_2, 'Orders', '/orders', activeRoute),
                _item(context, Icons.qr_code_scanner_outlined, Icons.qr_code_scanner, 'Scanning', '/scanning', activeRoute),
                _item(context, Icons.videocam_outlined, Icons.videocam, 'Recordings', '/recording', activeRoute),
                _item(context, Icons.analytics_outlined, Icons.analytics, 'Analytics', '/analytics', activeRoute),
                _item(context, Icons.notifications_outlined, Icons.notifications, 'Alerts', '/alerts', activeRoute, badge: alertsBadge),
                _item(context, Icons.assignment_return_outlined, Icons.assignment_return, 'Returns', '/returns', activeRoute),
                _item(context, Icons.people_outline, Icons.people, 'Users', '/users', activeRoute),
                _item(context, Icons.settings_outlined, Icons.settings, 'Settings', '/settings', activeRoute),
              ],
            ),
          ),

          Divider(height: 1, color: Colors.grey.shade200),

          // Logout
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: _item(
              context,
              Icons.logout,
              Icons.logout,
              'Logout',
              '/login',
              activeRoute,
              isDestructive: true,
            ),
          ),

          // Upgrade card
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 4, 12, 16),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Upgrade to Pro',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Unlock AI insights',
                    style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 11),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () => context.go('/plans'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white70),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                      ),
                      child: const Text('Upgrade Now', style: TextStyle(fontSize: 12)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );

    if (widget.isDrawer) {
      return Drawer(
        backgroundColor: Colors.white,
        child: content,
      );
    }

    return Container(
      width: 240,
      color: Colors.white,
      child: content,
    );
  }

  Widget _item(
    BuildContext context,
    IconData icon,
    IconData activeIcon,
    String label,
    String route,
    String currentPath, {
    String? badge,
    bool isDestructive = false,
  }) {
    final isActive = !isDestructive &&
        (currentPath == route ||
            (route != '/dashboard' && currentPath.startsWith(route)));
    final Color fg = isDestructive
        ? Colors.red.shade500
        : (isActive ? Colors.blue.shade700 : Colors.grey.shade700);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 1),
      child: Material(
        color: isActive ? Colors.blue.shade50 : Colors.transparent,
        borderRadius: BorderRadius.circular(9),
        child: InkWell(
          onTap: () async {
            if (Scaffold.of(context).hasDrawer && Scaffold.of(context).isDrawerOpen) {
              Navigator.of(context).pop();
            }

            if (label == 'Logout') {
              await ApiClient.clearTokens();
              if (context.mounted) {
                context.go('/login');
              }
            } else {
              context.go(route);
            }
          },
          borderRadius: BorderRadius.circular(9),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
            child: Row(
              children: [
                Icon(isActive ? activeIcon : icon, color: fg, size: 19),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      color: fg,
                      fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                      fontSize: 13,
                    ),
                  ),
                ),
                if (badge != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      badge,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

