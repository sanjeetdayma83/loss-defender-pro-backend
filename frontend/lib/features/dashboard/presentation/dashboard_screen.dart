import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_theme.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _loading = true;
  String? _error;

  // KPIs
  int _ordersTotal = 0;
  int _ordersPending = 0;
  int _ordersVerified = 0;
  int _exceptions = 0;
  int _activeOperators = 0;
  int _warehouses = 0;
  int _users = 0;

  // Pipeline counts by status
  final Map<String, int> _pipeline = {
    'synced': 0,
    'queued': 0,
    'packing': 0,
    'recording': 0,
    'dispatched': 0,
    'shipped': 0,
  };

  List<dynamic> _recentOrders = [];
  List<dynamic> _warehouseList = [];
  String? _companyName;

  @override
  void initState() {
    super.initState();
    _load();
  }

  List<dynamic> _asList(dynamic body) {
    if (body is Map && body['data'] is List) return body['data'] as List;
    if (body is Map && body['data'] is Map) {
      final d = body['data'] as Map;
      if (d['items'] is List) return d['items'] as List;
      if (d['data'] is List) return d['data'] as List;
    }
    if (body is List) return body;
    return [];
  }

  Map<String, dynamic>? _asMap(dynamic body) {
    if (body is Map && body['data'] is Map) {
      return Map<String, dynamic>.from(body['data'] as Map);
    }
    if (body is Map) return Map<String, dynamic>.from(body);
    return null;
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      // Parallel fetches
      final results = await Future.wait([
        ApiClient.instance.dio.get('/orders'),
        ApiClient.instance.dio.get('/warehouses'),
        ApiClient.instance.dio.get('/users'),
        ApiClient.instance.dio.get('/companies/me'),
        ApiClient.instance.dio.get('/analytics/kpis'),
      ]);

      final ordersRes = results[0];
      final whRes = results[1];
      final usersRes = results[2];
      final companyRes = results[3];
      final kpiRes = results[4];

      final orders = ordersRes != null ? _asList(ordersRes.data) : <dynamic>[];
      final warehouses =
          whRes != null ? _asList(whRes.data) : <dynamic>[];
      final users = usersRes != null ? _asList(usersRes.data) : <dynamic>[];
      final company =
          companyRes != null ? _asMap(companyRes.data) : null;
      final kpis = kpiRes != null ? _asMap(kpiRes.data) : null;

      // Reset pipeline
      for (final k in _pipeline.keys.toList()) {
        _pipeline[k] = 0;
      }

      int pending = 0;
      int verified = 0;
      int exceptions = 0;

      for (final o in orders) {
        if (o is! Map) continue;
        final status = (o['status']?.toString() ?? '').toLowerCase();
        if (_pipeline.containsKey(status)) {
          _pipeline[status] = (_pipeline[status] ?? 0) + 1;
        }
        // Pending-ish
        if (['synced', 'queued', 'packing', 'recording', 'pending']
            .contains(status)) {
          pending++;
        }
        if (['scanned', 'evidence_ready', 'dispatched', 'shipped', 'closed',
              'verified']
            .contains(status)) {
          verified++;
        }
        if (['claimed', 'returned', 'failed', 'exception'].contains(status)) {
          exceptions++;
        }
      }

      // Active operators = users with packing/qc/operator roles active
      final operators = users.where((u) {
        if (u is! Map) return false;
        final role = u['role']?.toString() ?? '';
        final status = u['status']?.toString() ?? '';
        return status == 'active' &&
            (role.contains('operator') ||
                role == 'supervisor' ||
                role == 'manager' ||
                role == 'owner');
      }).length;

      if (!mounted) return;
      setState(() {
        _ordersTotal = kpis?['ordersToday'] is num
            ? (kpis!['ordersToday'] as num).toInt()
            : orders.length;
        _ordersPending = kpis?['ordersPending'] is num
            ? (kpis!['ordersPending'] as num).toInt()
            : pending;
        _ordersVerified = kpis?['ordersVerified'] is num
            ? (kpis!['ordersVerified'] as num).toInt()
            : verified;
        _exceptions = kpis?['exceptions'] is num
            ? (kpis!['exceptions'] as num).toInt()
            : exceptions;
        _activeOperators = kpis?['activeOperators'] is num
            ? (kpis!['activeOperators'] as num).toInt()
            : operators;
        _warehouses = warehouses.length;
        _users = users.length;
        _warehouseList = warehouses;
        _recentOrders = orders.take(8).toList();
        _companyName = company?['companyName']?.toString() ??
            company?['name']?.toString();
        _loading = false;
      });
    } on DioException catch (e) {
      setState(() {
        _error = e.message ?? 'Failed to load dashboard';
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  String _fmt(int n) {
    if (n >= 1000000) return '${(n / 1000000).toStringAsFixed(1)}M';
    if (n >= 1000) {
      final s = n.toString();
      final buf = StringBuffer();
      for (var i = 0; i < s.length; i++) {
        if (i > 0 && (s.length - i) % 3 == 0) buf.write(',');
        buf.write(s[i]);
      }
      return buf.toString();
    }
    return '$n';
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 1100;

    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(_error!, style: const TextStyle(color: AppColors.danger)),
            const SizedBox(height: 12),
            FilledButton(onPressed: _load, child: const Text('Retry')),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: EdgeInsets.all(isWide ? 24 : 16),
        children: [
          Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Dashboard',
                        style: TextStyle(
                            fontSize: 22, fontWeight: FontWeight.w800)),
                    SizedBox(height: 4),
                    Text(
                      'Real-time overview of your warehouse operations and performance.',
                      style: TextStyle(
                          fontSize: 13, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: _load,
                icon: const Icon(Icons.refresh, size: 20),
                tooltip: 'Refresh',
              ),
              const SizedBox(width: 8),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today_outlined, size: 16),
                    const SizedBox(width: 8),
                    Text(
                      'Today, ${DateTime.now().day} ${_month(DateTime.now().month)} ${DateTime.now().year}',
                      style: const TextStyle(
                          fontSize: 13, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // KPI row
          LayoutBuilder(builder: (context, c) {
            final cross = c.maxWidth > 900
                ? 6
                : c.maxWidth > 600
                    ? 3
                    : 2;
            return GridView.count(
              crossAxisCount: cross,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: c.maxWidth > 900 ? 1.35 : 1.6,
              children: [
                _KpiCard(
                  title: 'Orders Total',
                  value: _fmt(_ordersTotal),
                  icon: Icons.shopping_cart_outlined,
                  color: const Color(0xFF3B82F6),
                  subtitle: 'All statuses',
                ),
                _KpiCard(
                  title: 'Orders Pending',
                  value: _fmt(_ordersPending),
                  icon: Icons.hourglass_empty,
                  color: const Color(0xFFF59E0B),
                  subtitle: 'In progress',
                ),
                _KpiCard(
                  title: 'Orders Verified',
                  value: _fmt(_ordersVerified),
                  icon: Icons.verified_outlined,
                  color: const Color(0xFF22C55E),
                  subtitle: 'Completed path',
                ),
                _KpiCard(
                  title: 'Exceptions',
                  value: _fmt(_exceptions),
                  icon: Icons.warning_amber_rounded,
                  color: const Color(0xFFEF4444),
                  subtitle: 'Claims / returns',
                ),
                _KpiCard(
                  title: 'Warehouses',
                  value: _fmt(_warehouses),
                  icon: Icons.warehouse_outlined,
                  color: const Color(0xFF8B5CF6),
                  subtitle: _companyName ?? 'Company',
                ),
                _KpiCard(
                  title: 'Active Team',
                  value: _fmt(_activeOperators),
                  icon: Icons.people_outline,
                  color: const Color(0xFF06B6D4),
                  subtitle: '$_users total users',
                ),
              ],
            );
          }),
          const SizedBox(height: 20),

          // Middle row: pipeline + warehouses
          if (isWide)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(flex: 5, child: _pipelineCard()),
                const SizedBox(width: 16),
                Expanded(flex: 4, child: _warehouseCard()),
              ],
            )
          else ...[
            _pipelineCard(),
            const SizedBox(height: 16),
            _warehouseCard(),
          ],
          const SizedBox(height: 16),

          // Recent activity
          _recentCard(),
        ],
      ),
    );
  }

  Widget _pipelineCard() {
    final steps = [
      ('Synced', 'synced', Icons.shopping_cart_outlined, const Color(0xFF3B82F6)),
      ('Queued', 'queued', Icons.hourglass_top, const Color(0xFFF59E0B)),
      ('Packing', 'packing', Icons.inventory_2_outlined, const Color(0xFF8B5CF6)),
      ('Recording', 'recording', Icons.videocam_outlined, const Color(0xFF06B6D4)),
      ('Dispatch', 'dispatched', Icons.local_shipping_outlined, const Color(0xFF22C55E)),
      ('Shipped', 'shipped', Icons.check_circle_outline, const Color(0xFF10B981)),
    ];
    final total = _pipeline.values.fold<int>(0, (a, b) => a + b);
    final done = (_pipeline['dispatched'] ?? 0) + (_pipeline['shipped'] ?? 0);
    final progress = total > 0 ? done / total : 0.0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text('Orders Pipeline',
                    style:
                        TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
              ),
              TextButton(
                onPressed: () => context.go('/orders'),
                child: const Text('View Pipeline',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              for (var i = 0; i < steps.length; i++) ...[
                if (i > 0)
                  Expanded(
                    child: Container(
                      height: 2,
                      color: AppColors.border,
                    ),
                  ),
                Column(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: steps[i].$4.withOpacity(0.12),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(steps[i].$3, color: steps[i].$4, size: 18),
                    ),
                    const SizedBox(height: 6),
                    Text(steps[i].$1,
                        style: const TextStyle(
                            fontSize: 10, fontWeight: FontWeight.w600)),
                    Text(
                      '${_pipeline[steps[i].$2] ?? 0}',
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: steps[i].$4),
                    ),
                  ],
                ),
              ],
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              const Text('Overall Progress',
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              const Spacer(),
              Text(
                '${(progress * 100).toStringAsFixed(1)}% Completed',
                style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF2563EB)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress.clamp(0.0, 1.0),
              minHeight: 8,
              backgroundColor: AppColors.border,
              color: const Color(0xFF2563EB),
            ),
          ),
        ],
      ),
    );
  }

  Widget _warehouseCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text('Live Warehouse Overview',
                    style:
                        TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
              ),
              TextButton(
                onPressed: () => context.go('/warehouses'),
                child: const Text('View All',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (_warehouseList.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Text('No warehouses yet — add one from Warehouses',
                    style:
                        TextStyle(fontSize: 13, color: AppColors.textSecondary)),
              ),
            )
          else
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                for (final w in _warehouseList.take(8))
                  _WhChip(w is Map ? w : <String, dynamic>{}),
              ],
            ),
        ],
      ),
    );
  }

  Widget _recentCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text('Recent Orders',
                    style:
                        TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
              ),
              TextButton(
                onPressed: () => context.go('/orders'),
                child: const Text('View All',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (_recentOrders.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Text('No orders yet',
                    style:
                        TextStyle(fontSize: 13, color: AppColors.textSecondary)),
              ),
            )
          else
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                headingRowHeight: 40,
                dataRowMinHeight: 44,
                dataRowMaxHeight: 52,
                columns: const [
                  DataColumn(label: Text('ORDER', style: _th)),
                  DataColumn(label: Text('STATUS', style: _th)),
                  DataColumn(label: Text('MARKETPLACE', style: _th)),
                  DataColumn(label: Text('CREATED', style: _th)),
                ],
                rows: [
                  for (final o in _recentOrders)
                    if (o is Map)
                      DataRow(cells: [
                        DataCell(Text(
                          o['marketplaceOrderId']?.toString() ??
                              o['id']?.toString() ??
                              '—',
                          style: const TextStyle(
                              fontWeight: FontWeight.w600, fontSize: 12),
                        )),
                        DataCell(_StatusPill(o['status']?.toString() ?? '')),
                        DataCell(Text(o['marketplace']?.toString() ?? '—',
                            style: const TextStyle(fontSize: 12))),
                        DataCell(Text(_shortDate(o['createdAt']?.toString()),
                            style: const TextStyle(fontSize: 12))),
                      ]),
                ],
              ),
            ),
        ],
      ),
    );
  }

  String _shortDate(String? iso) {
    if (iso == null) return '—';
    try {
      final d = DateTime.parse(iso).toLocal();
      return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return iso;
    }
  }

  String _month(int m) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[m - 1];
  }
}

const _th = TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textSecondary);

class _KpiCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final String subtitle;

  const _KpiCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 18),
              ),
              const Spacer(),
            ],
          ),
          const Spacer(),
          Text(value,
              style: const TextStyle(
                  fontSize: 22, fontWeight: FontWeight.w800, height: 1.1)),
          const SizedBox(height: 4),
          Text(title,
              style: const TextStyle(
                  fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
          Text(subtitle,
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}

class _WhChip extends StatelessWidget {
  final Map w;
  const _WhChip(this.w);

  @override
  Widget build(BuildContext context) {
    final name = w['name']?.toString() ?? 'Warehouse';
    final status = w['status']?.toString() ?? 'active';
    final code = w['code']?.toString() ?? '';
    Color c;
    switch (status) {
      case 'active':
        c = const Color(0xFF22C55E);
        break;
      case 'maintenance':
        c = const Color(0xFFF59E0B);
        break;
      default:
        c = AppColors.textSecondary;
    }
    return Container(
      width: 140,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(code.isNotEmpty ? code : name,
                    style: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 12),
                    overflow: TextOverflow.ellipsis),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: c.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(status,
                    style: TextStyle(
                        fontSize: 9, fontWeight: FontWeight.w700, color: c)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(name,
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
              maxLines: 1,
              overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final String status;
  const _StatusPill(this.status);

  @override
  Widget build(BuildContext context) {
    Color c;
    switch (status.toLowerCase()) {
      case 'shipped':
      case 'closed':
      case 'dispatched':
        c = const Color(0xFF22C55E);
        break;
      case 'packing':
      case 'recording':
      case 'queued':
        c = const Color(0xFFF59E0B);
        break;
      case 'claimed':
      case 'failed':
        c = const Color(0xFFEF4444);
        break;
      default:
        c = const Color(0xFF3B82F6);
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: c.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(status.isEmpty ? '—' : status,
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: c)),
    );
  }
}