import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class Sidebar extends StatelessWidget {
  const Sidebar({super.key});

  @override
  Widget build(BuildContext context) {
    final activeRoute = GoRouterState.of(context).uri.path;

    return Container(
      width: 260,
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Row(
              children: [
                const Icon(Icons.shield, color: Colors.blue, size: 32),
                const SizedBox(width: 12),
                Flexible(
                  child: Text(
                    "Loss Defender Pro",
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 16),
              children: [
                _SidebarItem(icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: "Dashboard", route: "/dashboard", currentPath: activeRoute),
                _SidebarItem(icon: Icons.shopping_bag_outlined, activeIcon: Icons.shopping_bag, label: "Orders", route: "/orders", currentPath: activeRoute),
                _SidebarItem(icon: Icons.qr_code_scanner_outlined, activeIcon: Icons.qr_code_scanner, label: "Scanning", route: "/scanning", currentPath: activeRoute),
                _SidebarItem(icon: Icons.videocam_outlined, activeIcon: Icons.videocam, label: "Recordings", route: "/recording", currentPath: activeRoute),
                _SidebarItem(icon: Icons.analytics_outlined, activeIcon: Icons.analytics, label: "Analytics", route: "/analytics", currentPath: activeRoute),
                _SidebarItem(icon: Icons.notifications_outlined, activeIcon: Icons.notifications, label: "Alerts", route: "/alerts", currentPath: activeRoute, badge: "6"),
                _SidebarItem(icon: Icons.assignment_return_outlined, activeIcon: Icons.assignment_return, label: "Returns", route: "/returns", currentPath: activeRoute),
                _SidebarItem(icon: Icons.people_outline, activeIcon: Icons.people, label: "Users", route: "/users", currentPath: activeRoute),
                _SidebarItem(icon: Icons.settings_outlined, activeIcon: Icons.settings, label: "Settings", route: "/settings", currentPath: activeRoute),
              ],
            ),
          ),
          const Divider(height: 1),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Card(
                color: Colors.blue.shade50,
                elevation: 0,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star, color: Colors.blue),
                      const SizedBox(height: 8),
                      const Text("Upgrade to Pro", style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      const Text("Unlock advanced analytics & AI insights.", style: TextStyle(fontSize: 12, color: Colors.grey)),
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed: () => context.go('/plans'),
                        style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(36)),
                        child: const Text("Upgrade Now"),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SidebarItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final String route;
  final String currentPath;
  final String? badge;

  const _SidebarItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.route,
    required this.currentPath,
    this.badge,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = currentPath == route;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Material(
        color: isActive ? Colors.blue.shade50 : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: () => context.go(route),
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: Row(
              children: [
                Icon(
                  isActive ? activeIcon : icon,
                  color: isActive ? Colors.blue : Colors.grey.shade700,
                  size: 22,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      color: isActive ? Colors.blue.shade700 : Colors.grey.shade800,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                if (badge != null)
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                    child: Text(badge!, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
