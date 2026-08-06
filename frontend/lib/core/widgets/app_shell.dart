import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../network/api_client.dart';
import '../theme/app_theme.dart';

class AppShell extends StatefulWidget {
  final Widget child;
  final String currentPath;

  const AppShell({
    super.key,
    required this.child,
    required this.currentPath,
  });

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int? _storageUsed;
  int? _storageQuota;
  String? _companyName;

  static const _navItems = <_NavItem>[
    _NavItem('/dashboard', 'Dashboard', Icons.dashboard_outlined),
    _NavItem('/orders', 'Orders', Icons.receipt_long_outlined),
    _NavItem('/scanner', 'Scanner', Icons.qr_code_scanner),
    _NavItem('/recording', 'Recording', Icons.videocam_outlined),
    _NavItem('/dispatch', 'Dispatch', Icons.local_shipping_outlined),
    _NavItem('/warehouses', 'Warehouses', Icons.warehouse_outlined),
    _NavItem('/users', 'Users', Icons.people_outline),
    _NavItem('/analytics', 'Analytics', Icons.bar_chart_outlined),
    _NavItem('/returns', 'Returns', Icons.assignment_return_outlined),
    _NavItem('/evidence', 'Evidence', Icons.photo_library_outlined),
    _NavItem('/claims', 'Claims', Icons.gavel_outlined),
    _NavItem('/settings', 'Settings', Icons.settings_outlined),
  ];

  @override
  void initState() {
    super.initState();
    _loadCompany();
  }

  Future<void> _loadCompany() async {
    try {
      final res = await ApiClient.instance.dio.get('/companies/me');
      final body = res.data;
      final data = body is Map && body['data'] != null ? body['data'] : body;
      if (data is Map) {
        setState(() {
          _companyName =
              data['companyName']?.toString() ?? data['name']?.toString();
          _storageUsed = int.tryParse('${data['storageUsed'] ?? 0}');
          _storageQuota =
              int.tryParse('${data['storageQuota'] ?? 10737418240}');
        });
      }
    } on DioException {
      // silent
    }
  }

  String _fmtBytes(int b) {
    if (b < 1024) return '$b B';
    if (b < 1024 * 1024) return '${(b / 1024).toStringAsFixed(1)} KB';
    if (b < 1024 * 1024 * 1024) {
      return '${(b / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(b / (1024 * 1024 * 1024)).toStringAsFixed(2)} GB';
  }

  Widget _storageFooter() {
    final used = _storageUsed ?? 0;
    final quota = _storageQuota ?? 10737418240;
    final pct = quota > 0 ? (used / quota).clamp(0.0, 1.0) : 0.0;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _companyName ?? 'Storage',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: pct,
              minHeight: 6,
              backgroundColor: AppColors.border,
              color: pct > 0.9
                  ? AppColors.danger
                  : pct > 0.7
                      ? AppColors.warning
                      : AppColors.accent,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '${_fmtBytes(used)} / ${_fmtBytes(quota)}',
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  void _go(BuildContext context, String route) {
    if (widget.currentPath != route) {
      context.go(route);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 960;

    if (!isWide) {
      final mobileItems = _navItems.take(5).toList();
      int idx = mobileItems
          .indexWhere((e) => widget.currentPath.startsWith(e.route));
      if (idx < 0) idx = 0;

      return Scaffold(
        body: widget.child,
        bottomNavigationBar: NavigationBar(
          selectedIndex: idx,
          onDestinationSelected: (i) => _go(context, mobileItems[i].route),
          destinations: [
            for (final e in mobileItems)
              NavigationDestination(icon: Icon(e.icon), label: e.label),
          ],
        ),
      );
    }

    return Scaffold(
      body: Row(
        children: [
          Container(
            width: 240,
            color: Colors.white,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
                  child: Row(
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.shield,
                            color: Colors.white, size: 18),
                      ),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text(
                          'Loss Defender',
                          style: TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 15),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    children: [
                      for (final item in _navItems)
                        _NavTile(
                          item: item,
                          selected: widget.currentPath.startsWith(item.route),
                          onTap: () => _go(context, item.route),
                        ),
                    ],
                  ),
                ),
                _storageFooter(),
              ],
            ),
          ),
          const VerticalDivider(width: 1),
          Expanded(child: widget.child),
        ],
      ),
    );
  }
}

class _NavTile extends StatelessWidget {
  final _NavItem item;
  final bool selected;
  final VoidCallback onTap;

  const _NavTile({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 2),
      child: Material(
        color: selected
            ? AppColors.accent.withOpacity(0.1)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          hoverColor: AppColors.accent.withOpacity(0.06),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            child: Row(
              children: [
                Icon(
                  item.icon,
                  size: 20,
                  color: selected ? AppColors.accent : AppColors.textSecondary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item.label,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight:
                          selected ? FontWeight.w600 : FontWeight.w500,
                      color: selected ? AppColors.accent : null,
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

class _NavItem {
  final String route;
  final String label;
  final IconData icon;
  const _NavItem(this.route, this.label, this.icon);
}