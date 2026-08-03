import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class AnalyticsPage extends StatefulWidget {
  const AnalyticsPage({super.key});

  @override
  State<AnalyticsPage> createState() => _AnalyticsPageState();
}

class _AnalyticsPageState extends State<AnalyticsPage> {
  final Dio _dio = ApiClient.dio;

  bool isLoading = true;
  String? errorMessage;

  Map<String, dynamic> stats = {};
  int todayOrders = 0;
  int packingCount = 0;
  int verificationCount = 0;
  int readyToShipCount = 0;

  List<Map<String, dynamic>> byMarketplace = [];
  List<Map<String, dynamic>> byStatus = [];

  @override
  void initState() {
    super.initState();
    fetchAnalytics();
  }

  Map<String, dynamic>? _unwrap(dynamic body) {
    if (body is! Map) return null;
    final map = Map<String, dynamic>.from(body);
    if (map['data'] is Map) return Map<String, dynamic>.from(map['data'] as Map);
    return map;
  }

  Future<Response?> _safeGet(String path) async {
    try {
      return await _dio.get(path);
    } catch (_) {
      return null;
    }
  }

  Future<void> fetchAnalytics() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final dashRes = await _safeGet(ApiEndpoints.ordersDashboard);
      final data = _unwrap(dashRes?.data);

      if (data == null) {
        throw Exception(
          'No data from /orders/dashboard.\nIs the API running on :3000?',
        );
      }

      stats = data['statistics'] is Map
          ? Map<String, dynamic>.from(data['statistics'] as Map)
          : {};

      final today = data['todayOrders'];
      todayOrders = today is num
          ? today.toInt()
          : (today is List ? today.length : 0);

      packingCount = data['packingQueue'] is List
          ? (data['packingQueue'] as List).length
          : ((stats['packing'] as num?)?.toInt() ?? 0);

      verificationCount = data['verificationQueue'] is List
          ? (data['verificationQueue'] as List).length
          : ((stats['verifying'] as num?)?.toInt() ?? 0);

      readyToShipCount = data['readyToShipQueue'] is List
          ? (data['readyToShipQueue'] as List).length
          : 0;

      final mktRes = await _safeGet(ApiEndpoints.analyticsMarketplace);
      final mktData = _unwrap(mktRes?.data);
      if (mktData != null) {
        final list = mktData['items'] ?? mktData['data'] ?? mktRes?.data;
        if (list is List) {
          byMarketplace = list
              .map((e) => Map<String, dynamic>.from(e as Map))
              .toList();
        }
      }

      final statusRes = await _safeGet(ApiEndpoints.analyticsStatus);
      final statusData = _unwrap(statusRes?.data);
      if (statusData != null) {
        final list = statusData['items'] ?? statusData['data'] ?? statusRes?.data;
        if (list is List) {
          byStatus =
              list.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        }
      }

      if (byStatus.isEmpty && stats.isNotEmpty) {
        byStatus = stats.entries
            .where((e) => e.key != 'total')
            .map((e) => {'status': e.key, 'count': e.value})
            .toList();
      }

      setState(() => isLoading = false);
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = e is DioException
            ? (e.response?.data is Map
                ? (e.response!.data['message']?.toString() ?? e.message)
                : e.message)
            : e.toString();
      });
    }
  }

  int get total => (stats['total'] as num?)?.toInt() ?? 0;
  int get verified =>
      ((stats['shipped'] as num?)?.toInt() ?? 0) +
      ((stats['delivered'] as num?)?.toInt() ?? 0);
  int get pending =>
      ((stats['created'] as num?)?.toInt() ?? 0) +
      ((stats['assigned'] as num?)?.toInt() ?? 0) +
      ((stats['packing'] as num?)?.toInt() ?? 0) +
      ((stats['recording'] as num?)?.toInt() ?? 0) +
      ((stats['verifying'] as num?)?.toInt() ?? 0);
  int get exceptions =>
      ((stats['cancelled'] as num?)?.toInt() ?? 0) +
      ((stats['returned'] as num?)?.toInt() ?? 0) +
      ((stats['claimed'] as num?)?.toInt() ?? 0);

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: 'Analytics',
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage != null
              ? _errorState()
              : LayoutBuilder(
                  builder: (context, constraints) {
                    final isMobile = constraints.maxWidth < 650;
                    final wide = constraints.maxWidth > 900;

                    return SingleChildScrollView(
                      padding: EdgeInsets.all(isMobile ? 16 : 28),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Header
                          if (isMobile)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Analytics & Performance',
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1E2329),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                const Text(
                                  'Live data from Orders service',
                                  style: TextStyle(color: Colors.grey, fontSize: 13),
                                ),
                                const SizedBox(height: 12),
                                SizedBox(
                                  width: double.infinity,
                                  child: OutlinedButton.icon(
                                    onPressed: fetchAnalytics,
                                    icon: const Icon(Icons.refresh, size: 16),
                                    label: const Text('Refresh'),
                                  ),
                                ),
                              ],
                            )
                          else
                            Row(
                              children: [
                                const Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Analytics & Performance',
                                        style: TextStyle(
                                          fontSize: 22,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF1E2329),
                                        ),
                                      ),
                                      SizedBox(height: 4),
                                      Text(
                                        'Live data from Orders service',
                                        style: TextStyle(color: Colors.grey, fontSize: 13),
                                      ),
                                    ],
                                  ),
                                ),
                                OutlinedButton.icon(
                                  onPressed: fetchAnalytics,
                                  icon: const Icon(Icons.refresh, size: 16),
                                  label: const Text('Refresh'),
                                ),
                              ],
                            ),
                          const SizedBox(height: 24),

                          // KPI cards
                          Wrap(
                            spacing: isMobile ? 12 : 16,
                            runSpacing: isMobile ? 12 : 16,
                            children: [
                              _kpi('Total Orders', '$total', Icons.receipt_long,
                                  Colors.blue, 'Today: $todayOrders', isMobile, wide),
                              _kpi(
                                  'Verified / Shipped',
                                  '$verified',
                                  Icons.verified,
                                  Colors.green,
                                  total > 0
                                      ? '${((verified / total) * 100).toStringAsFixed(1)}% of total'
                                      : '0%',
                                  isMobile,
                                  wide),
                              _kpi(
                                  'Pending Pipeline',
                                  '$pending',
                                  Icons.hourglass_top,
                                  Colors.orange,
                                  'Packing: $packingCount · Verifying: $verificationCount',
                                  isMobile,
                                  wide),
                              _kpi(
                                  'Exceptions',
                                  '$exceptions',
                                  Icons.warning_amber,
                                  Colors.red,
                                  'Ready to ship: $readyToShipCount',
                                  isMobile,
                                  wide),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Two columns: status breakdown + pipeline
                          Flex(
                            direction: wide ? Axis.horizontal : Axis.vertical,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: _card(
                                  title: 'Order Status Breakdown',
                                  child: Column(
                                    children: byStatus.isEmpty
                                        ? [
                                            Padding(
                                              padding: const EdgeInsets.all(24),
                                              child: Text(
                                                'No status data',
                                                style: TextStyle(
                                                    color: Colors.grey.shade500),
                                              ),
                                            )
                                          ]
                                        : byStatus.map((row) {
                                            final label = (row['status'] ??
                                                    row['name'] ??
                                                    '—')
                                                .toString();
                                            final count = (row['count'] as num?)
                                                    ?.toInt() ??
                                                0;
                                            final pct = total > 0
                                                ? (count / total)
                                                : 0.0;
                                            return Padding(
                                              padding: const EdgeInsets.symmetric(
                                                  vertical: 8),
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Row(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment
                                                            .spaceBetween,
                                                    children: [
                                                      Text(
                                                        label.toUpperCase(),
                                                        style: const TextStyle(
                                                          fontSize: 12,
                                                          fontWeight:
                                                              FontWeight.w600,
                                                          color:
                                                              Color(0xFF1E2329),
                                                        ),
                                                      ),
                                                      Text(
                                                        '$count  (${(pct * 100).toStringAsFixed(0)}%)',
                                                        style: TextStyle(
                                                          fontSize: 12,
                                                          color: Colors
                                                              .grey.shade600,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 6),
                                                  ClipRRect(
                                                    borderRadius:
                                                        BorderRadius.circular(4),
                                                    child: LinearProgressIndicator(
                                                      value: pct.clamp(0.0, 1.0),
                                                      minHeight: 6,
                                                      backgroundColor:
                                                          Colors.grey.shade100,
                                                      color: _barColor(label),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            );
                                          }).toList(),
                                  ),
                                ),
                              ),
                              SizedBox(
                                  width: wide ? 20 : 0, height: wide ? 0 : 20),
                              Expanded(
                                child: _card(
                                  title: 'Pipeline Queues',
                                  child: Column(
                                    children: [
                                      _queueRow('Packing queue', packingCount,
                                          Colors.orange),
                                      const Divider(height: 24),
                                      _queueRow('Verification queue',
                                          verificationCount, Colors.blue),
                                      const Divider(height: 24),
                                      _queueRow('Ready to ship',
                                          readyToShipCount, Colors.green),
                                      const Divider(height: 24),
                                      _queueRow("Today's orders", todayOrders,
                                          Colors.indigo),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),

                          // Info
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.blue.shade50,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.blue.shade100),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.info_outline,
                                    color: Colors.blue.shade700, size: 18),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    'Charts and Loss Prevented metrics are live from the API service.',
                                    style: TextStyle(
                                      fontSize: 12.5,
                                      color: Colors.blue.shade900,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }

  Color _barColor(String label) {
    final s = label.toUpperCase();
    if (s.contains('DELIVER') || s.contains('SHIP')) return Colors.green;
    if (s.contains('CANCEL') || s.contains('RETURN') || s.contains('CLAIM')) {
      return Colors.red;
    }
    if (s.contains('CREATED') || s.contains('ASSIGN') || s.contains('PACK')) {
      return Colors.orange;
    }
    return Colors.blue;
  }

  Widget _kpi(
    String title,
    String value,
    IconData icon,
    Color color,
    String subtitle,
    bool isMobile,
    bool wide,
  ) {
    return SizedBox(
      width: isMobile ? double.infinity : (wide ? 240 : 300),
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(7),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(icon, color: color, size: 18),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              value,
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1E2329),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                color: color,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _card({required String title, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E2329),
            ),
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _queueRow(String label, int count, Color color) {
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(label,
              style: TextStyle(fontSize: 13, color: Colors.grey.shade700)),
        ),
        Text(
          '$count',
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1E2329),
          ),
        ),
      ],
    );
  }

  Widget _errorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cloud_off, size: 56, color: Colors.grey.shade400),
            const SizedBox(height: 16),
            const Text('Could not load analytics',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(
              errorMessage ?? '',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: fetchAnalytics,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
