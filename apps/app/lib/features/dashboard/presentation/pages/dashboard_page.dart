import 'dart:async';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class DashboardPage extends StatefulWidget {
  const DashboardPage({super.key});

  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  final Dio _dio = ApiClient.dio;

  bool isLoading = true;
  String? errorMessage;

  String currentUserName = 'Admin';
  int totalOrders = 0;
  int verifiedOrders = 0;
  int pendingOrders = 0;
  int exceptionOrders = 0;
  int packingCount = 0;
  int verificationCount = 0;
  int readyToShipCount = 0;
  int todayOrders = 0;

  List<Map<String, dynamic>> recentOrders = [];
  Timer? _refreshTimer;
  bool _silentRefresh = false;

  @override
  void initState() {
    super.initState();
    fetchDashboardData();
    // Quiet auto-refresh every 60s while dashboard is open
    _refreshTimer = Timer.periodic(const Duration(seconds: 60), (_) {
      if (!mounted || isLoading) { return; }
      _silentRefresh = true;
      fetchDashboardData();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Map<String, dynamic>? _unwrap(dynamic body) {
    if (body is! Map) { return null; }
    final map = Map<String, dynamic>.from(body);
    if (map.containsKey('data') && map['data'] is Map) {
      return Map<String, dynamic>.from(map['data'] as Map);
    }
    return map;
  }

  Future<Response?> _safeGet(String path) async {
    try {
      return await _dio.get(path);
    } catch (_) {
      return null;
    }
  }

  Future<void> fetchDashboardData() async {
    setState(() {
      if (!_silentRefresh) { isLoading = true; }
      errorMessage = null;
    });

    try {
      final summaryRes = await _safeGet(ApiEndpoints.ordersDashboard);
      final recentRes = await _safeGet('/orders/recent');
      final profileRes = await _safeGet(ApiEndpoints.profile);

      if (profileRes?.data != null) {
        final p = _unwrap(profileRes!.data) ?? (profileRes.data is Map ? Map<String, dynamic>.from(profileRes.data as Map) : null);
        if (p != null) {
          currentUserName = (p['name'] ?? p['fullName'] ?? p['username'] ?? 'Admin').toString();
        }
      }

      final data = _unwrap(summaryRes?.data);
      if (data == null) { throw Exception('Dashboard endpoint returned no data.'); }

      final stats = data['statistics'] is Map ? Map<String, dynamic>.from(data['statistics'] as Map) : <String, dynamic>{};

      totalOrders = (stats['total'] as num?)?.toInt() ?? 0;
      verifiedOrders = ((stats['shipped'] as num?)?.toInt() ?? 0) + ((stats['delivered'] as num?)?.toInt() ?? 0);
      pendingOrders = ((stats['created'] as num?)?.toInt() ?? 0) + ((stats['assigned'] as num?)?.toInt() ?? 0) + ((stats['packing'] as num?)?.toInt() ?? 0) + ((stats['recording'] as num?)?.toInt() ?? 0) + ((stats['verifying'] as num?)?.toInt() ?? 0);
      exceptionOrders = ((stats['cancelled'] as num?)?.toInt() ?? 0) + ((stats['returned'] as num?)?.toInt() ?? 0) + ((stats['claimed'] as num?)?.toInt() ?? 0);

      packingCount = data['packingQueue'] is List ? (data['packingQueue'] as List).length : ((stats['packing'] as num?)?.toInt() ?? 0);
      verificationCount = data['verificationQueue'] is List ? (data['verificationQueue'] as List).length : ((stats['verifying'] as num?)?.toInt() ?? 0);
      readyToShipCount = data['readyToShipQueue'] is List ? (data['readyToShipQueue'] as List).length : 0;

      final today = data['todayOrders'];
      todayOrders = today is num ? today.toInt() : (today is List ? today.length : 0);

      List items = [];
      final recentBody = recentRes?.data;
      if (recentBody is List) {
        items = recentBody;
      } else if (recentBody is Map) {
        final unwrapped = _unwrap(recentBody);
        if (unwrapped != null) {
          if (unwrapped.containsKey('items')) {
            items = unwrapped['items'] as List? ?? [];
          } else if (unwrapped.containsKey('data') && unwrapped['data'] is List) { items = unwrapped['data'] as List; }
        }
        if (items.isEmpty && recentBody['data'] is List) { items = recentBody['data'] as List; }
      }

      recentOrders = items.take(8).map<Map<String, dynamic>>((e) {
        final m = Map<String, dynamic>.from(e as Map);
        final customer = m['customer'] is Map ? (m['customer']['name'] ?? m['customer']['companyName']) : (m['customerName'] ?? m['customer'] ?? '—');
        return {
          'id': m['orderNumber'] ?? m['id'] ?? '—',
          'awb': m['awb'] ?? m['trackingNumber'] ?? m['awbNumber'] ?? '—',
          'customer': customer?.toString() ?? '—',
          'status': (m['status'] ?? 'UNKNOWN').toString(),
          'date': _formatDate(m['createdAt'] ?? m['updatedAt']),
        };
      }).toList();

      setState(() { isLoading = false; _silentRefresh = false; });
    } catch (e) {
      setState(() {
        isLoading = false;
        _silentRefresh = false;
        errorMessage = e is DioException ? (e.response?.data is Map ? (e.response!.data['message']?.toString() ?? e.message) : e.message) : e.toString();
      });
    }
  }

  String _formatDate(dynamic raw) {
    if (raw == null) { return '—'; }
    try {
      final dt = DateTime.parse(raw.toString()).toLocal();
      return '${dt.day.toString().padLeft(2, '0')} ${_month(dt.month)} ${dt.year}';
    } catch (_) {
      return raw.toString();
    }
  }

  String _month(int m) {
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[m];
  }

  Color _statusColor(String status) {
    final s = status.toUpperCase();
    if (s.contains('DELIVER') || s.contains('SHIP') || s.contains('VERIF')) { return Colors.green; }
    if (s.contains('CANCEL') || s.contains('RETURN') || s.contains('CLAIM') || s.contains('EXCEPT')) { return Colors.red; }
    if (s.contains('PEND') || s.contains('ASSIGN') || s.contains('PACK') || s.contains('RECORD') || s.contains('CREATED')) { return Colors.orange; }
    return Colors.blueGrey;
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: 'Dashboard Overview',
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage != null
              ? _buildErrorState()
              : LayoutBuilder(
                  builder: (context, constraints) {
                    final isMobile = constraints.maxWidth < 650;
                    final isWide = constraints.maxWidth > 900;
                    
                    return SingleChildScrollView(
                      padding: EdgeInsets.all(isMobile ? 16.0 : 32.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (isMobile)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Welcome back, $currentUserName', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1E2329))),
                                const SizedBox(height: 4),
                                const Text('Overview updates automatically', style: TextStyle(color: Colors.grey, fontSize: 13)),
                                const SizedBox(height: 16),
                                Align(
                                  alignment: Alignment.centerRight,
                                  child: IconButton(
                                    tooltip: 'Refresh',
                                    onPressed: isLoading ? null : fetchDashboardData,
                                    icon: const Icon(Icons.refresh),
                                  ),
                                ),
                              ],
                            )
                          else
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Welcome back, $currentUserName', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E2329))),
                                      const SizedBox(height: 4),
                                      const Text('Overview updates automatically', style: TextStyle(color: Colors.grey, fontSize: 13)),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  tooltip: 'Refresh',
                                  onPressed: isLoading ? null : fetchDashboardData,
                                  icon: const Icon(Icons.refresh),
                                ),
                              ],
                            ),
                          
                          const SizedBox(height: 24),
                          
                          // STATS CARDS - Wrap using Grid on mobile to prevent overflow
                          isMobile ? GridView.count(
                            crossAxisCount: 1,
                            // Increased aspect ratio to prevent overflow
                            childAspectRatio: 2.5,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            children: _buildStatCards(isMobile, isWide),
                          ) : Wrap(
                            spacing: 20,
                            runSpacing: 20,
                            children: _buildStatCards(isMobile, isWide),
                          ),
                          
                          const SizedBox(height: 24),
                          
                          // INFO BANNER
                          Card(
                            elevation: 0,
                            color: Colors.blue.shade50,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.blue.shade100)),
                            child: Padding(
                              padding: EdgeInsets.all(isMobile ? 16 : 20),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Icon(Icons.info_outline, color: Colors.blue),
                                  const SizedBox(width: 12),
                                  const Expanded(
                                    child: Text(
                                      'Numbers above are live from the Orders service. Loss Prevented will appear once Evidence / Claims modules write data.',
                                      style: TextStyle(fontSize: 13, color: Color(0xFF1E3A5F)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          
                          const SizedBox(height: 24),
                          
                          // RECENT ORDERS TABLE
                          Card(
                            elevation: 0,
                            color: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                            child: Padding(
                              padding: EdgeInsets.all(isMobile ? 16 : 20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text('Recent Orders', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                      TextButton(onPressed: () => context.go('/orders'), child: const Text('View All')),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  if (recentOrders.isEmpty)
                                    const Padding(
                                      padding: EdgeInsets.symmetric(vertical: 24),
                                      child: Center(child: Text('No orders yet — create some from the Orders page.', style: TextStyle(color: Colors.grey))),
                                    )
                                  else
                                    SingleChildScrollView(
                                      scrollDirection: Axis.horizontal, // horizontal scroll for mobile
                                      child: DataTable(
                                        columns: const [
                                          DataColumn(label: Text('Order ID')),
                                          DataColumn(label: Text('AWB / Tracking')),
                                          DataColumn(label: Text('Customer')),
                                          DataColumn(label: Text('Status')),
                                          DataColumn(label: Text('Date')),
                                        ],
                                        rows: recentOrders.map((order) {
                                          final status = order['status'].toString();
                                          final color = _statusColor(status);
                                          return DataRow(cells: [
                                            DataCell(Text(order['id'].toString())),
                                            DataCell(Text(order['awb'].toString())),
                                            DataCell(Text(order['customer'].toString())),
                                            DataCell(
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                                                child: Text(status, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
                                              ),
                                            ),
                                            DataCell(Text(order['date'].toString(), style: const TextStyle(color: Colors.grey))),
                                          ]);
                                        }).toList(),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }

  List<Widget> _buildStatCards(bool isMobile, bool isWide) {
    return [
      _statCard('Total Orders', totalOrders.toString(), Icons.shopping_cart, Colors.blue, 'Today: $todayOrders', isMobile, isWide),
      _statCard('Verified / Shipped', verifiedOrders.toString(), Icons.check_circle, Colors.green, totalOrders > 0 ? '${((verifiedOrders / totalOrders) * 100).toStringAsFixed(1)}% of total' : '0%', isMobile, isWide),
      _statCard('Pending Queue', pendingOrders.toString(), Icons.hourglass_top, Colors.orange, 'Packing: $packingCount · Verifying: $verificationCount', isMobile, isWide),
      _statCard('Exceptions / Flagged', exceptionOrders.toString(), Icons.warning, Colors.red, 'Ready to ship: $readyToShipCount', isMobile, isWide),
    ];
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cloud_off, size: 64, color: Colors.grey.shade400),
            const SizedBox(height: 16),
            const Text('Could not load dashboard', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(errorMessage ?? 'Unknown error', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
            const SizedBox(height: 24),
            FilledButton.icon(onPressed: fetchDashboardData, icon: const Icon(Icons.refresh), label: const Text('Retry')),
          ],
        ),
      ),
    );
  }

  Widget _statCard(String title, String value, IconData icon, Color color, String subtitle, bool isMobile, bool isWide) {
    return SizedBox(
      width: isMobile ? double.infinity : (isWide ? 260 : 300),
      child: Card(
        elevation: 0,
        color: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
        child: Padding(
          padding: EdgeInsets.all(isMobile ? 12.0 : 20.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            // MainAxisSize.min allows column to size to its children
            mainAxisSize: MainAxisSize.min, 
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(child: Text(title, style: const TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.w600))),
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                    child: Icon(icon, color: color, size: 18),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFF1E2329))),
              const SizedBox(height: 4),
              // Use Expanded/Flexible to handle long text gracefully
              Flexible(child: Text(subtitle, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold), overflow: TextOverflow.ellipsis)),
            ],
          ),
        ),
      ),
    );
  }
}





