import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/api/api_client.dart';

class Sidebar extends StatelessWidget {
  final bool isDrawer;
  
  const Sidebar({super.key, this.isDrawer = false});

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
                _item(context, Icons.bar_chart_outlined, Icons.bar_chart, 'Analytics', '/analytics', activeRoute),
                _item(context, Icons.notifications_outlined, Icons.notifications, 'Alerts', '/alerts', activeRoute, badge: '6'),
                _item(context, Icons.assignment_return_outlined, Icons.assignment_return, 'Returns', '/returns', activeRoute),
                _item(context, Icons.people_outline, Icons.people, 'Users', '/users', activeRoute),
                _item(context, Icons.settings_outlined, Icons.settings, 'Settings', '/settings', activeRoute),
              ],
            ),
          ),
          // Bottom
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Divider(height: 1, color: Colors.grey.shade200),
          ),
          const SizedBox(height: 4),
          _item(
            context,
            Icons.logout_rounded,
            Icons.logout_rounded,
            'Logout',
            '/login',
            activeRoute,
            isDestructive: true,
          ),
          const SizedBox(height: 6),
          // Upgrade card
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 14),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E40AF), Color(0xFF3B82F6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.workspace_premium, color: Colors.amber, size: 16),
                      SizedBox(width: 6),
                      Text(
                        'Upgrade to Pro',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Unlock AI insights',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 10,
                    ),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    height: 30,
                    child: FilledButton(
                      onPressed: () => context.go('/plans'),
                      style: FilledButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF1E40AF),
                        padding: EdgeInsets.zero,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(7),
                        ),
                        textStyle: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 11,
                        ),
                      ),
                      child: const Text('Upgrade Now'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );

    if (isDrawer) {
      return content;
    }

    return Container(
      width: 250,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(right: BorderSide(color: Colors.grey.shade200)),
      ),
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
            // Mobile drawer close karne ke liye
            if (Scaffold.of(context).hasDrawer && Scaffold.of(context).isDrawerOpen) {
              Navigator.of(context).pop();
            }
            
            // Logout Logic
            if (label == 'Logout') {
              await ApiClient.clearTokens(); // Token delete karo
              if (context.mounted) {
                context.go('/login'); // Phir login screen par bhejo
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
