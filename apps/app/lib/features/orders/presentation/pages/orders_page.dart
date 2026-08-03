import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class OrdersPage extends StatefulWidget {
  const OrdersPage({super.key});

  @override
  State<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends State<OrdersPage> {
  final Dio _dio = ApiClient.dio;
  final TextEditingController _searchCtrl = TextEditingController();

  bool isLoading = true;
  String? errorMessage;
  List<Map<String, dynamic>> orders = [];
  List<Map<String, dynamic>> filtered = [];
  String statusFilter = 'ALL';
  int totalCount = 0;

  static const statusFilters = [
    'ALL',
    'CREATED',
    'ASSIGNED',
    'PACKING',
    'RECORDING',
    'VERIFYING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
    'CLAIMED',
  ];

  @override
  void initState() {
    super.initState();
    fetchOrders();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Map<String, dynamic>? _unwrap(dynamic body) {
    if (body is! Map) return null;
    final map = Map<String, dynamic>.from(body);
    if (map['data'] is Map) return Map<String, dynamic>.from(map['data'] as Map);
    return map;
  }

  Future<void> fetchOrders() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final res = await _dio.get(
        ApiEndpoints.orders,
        queryParameters: {'page': 1, 'limit': 50, 'sortBy': 'createdAt', 'sortOrder': 'desc'},
      );

      final data = _unwrap(res.data);
      List items = [];
      if (data != null) {
        if (data['items'] is List) {
          items = data['items'] as List;
          totalCount = (data['total'] as num?)?.toInt() ?? items.length;
        } else if (data['data'] is List) {
          items = data['data'] as List;
          totalCount = items.length;
        }
      } else if (res.data is List) {
        items = res.data as List;
        totalCount = items.length;
      }

      orders = items.map<Map<String, dynamic>>((e) {
        final m = Map<String, dynamic>.from(e as Map);
        final customer = m['customerName'] ??
            (m['customer'] is Map
                ? (m['customer']['name'] ?? m['customer']['fullName'])
                : m['customer']) ??
            '—';

        return {
          'id': m['id']?.toString() ?? '',
          'orderNumber': m['orderNumber']?.toString() ?? m['id']?.toString() ?? '—',
          'awb': m['awbNumber'] ?? m['trackingNumber'] ?? m['marketplaceShipmentId'] ?? '—',
          'customer': customer.toString(),
          'phone': m['customerPhone']?.toString() ?? '—',
          'status': (m['status'] ?? 'UNKNOWN').toString(),
          'priority': (m['priority'] ?? 'MEDIUM').toString(),
          'marketplace': (m['marketplace'] ?? '—').toString(),
          'warehouseId': m['warehouseId']?.toString() ?? '',
          'date': _formatDate(m['createdAt']),
          'raw': m,
        };
      }).toList();

      _applyFilters();
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

  void _applyFilters() {
    final q = _searchCtrl.text.trim().toLowerCase();
    filtered = orders.where((o) {
      final matchStatus =
          statusFilter == 'ALL' || o['status'].toString().toUpperCase() == statusFilter;
      if (!matchStatus) return false;
      if (q.isEmpty) return true;
      return o['orderNumber'].toString().toLowerCase().contains(q) ||
          o['awb'].toString().toLowerCase().contains(q) ||
          o['customer'].toString().toLowerCase().contains(q);
    }).toList();
    setState(() {});
  }

  String _formatDate(dynamic raw) {
    if (raw == null) return '—';
    try {
      final dt = DateTime.parse(raw.toString()).toLocal();
      const months = [
        '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${dt.day.toString().padLeft(2, '0')} ${months[dt.month]} ${dt.year}';
    } catch (_) {
      return raw.toString().length >= 10 ? raw.toString().substring(0, 10) : raw.toString();
    }
  }

  Color _statusColor(String status) {
    final s = status.toUpperCase();
    if (s.contains('DELIVER') || s.contains('SHIP') || s == 'VERIFIED') return Colors.green;
    if (s.contains('CANCEL') || s.contains('RETURN') || s.contains('CLAIM')) return Colors.red;
    if (s.contains('CREATED') || s.contains('ASSIGN') || s.contains('PACK') ||
        s.contains('RECORD') || s.contains('VERIF') || s.contains('PEND')) {
      return Colors.orange;
    }
    return Colors.blueGrey;
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: 'Orders',
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage != null
              ? _errorState()
              : LayoutBuilder(
                  builder: (context, constraints) {
                    final isMobile = constraints.maxWidth < 650;
                    
                    return Padding(
                      padding: EdgeInsets.all(isMobile ? 16 : 28),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Header
                          if (isMobile)
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                const Text(
                                  'Orders Management',
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1E2329),
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '$totalCount total orders · showing ${filtered.length}',
                                  style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                                ),
                                const SizedBox(height: 16),
                                OutlinedButton.icon(
                                  onPressed: fetchOrders,
                                  icon: const Icon(Icons.refresh, size: 16),
                                  label: const Text('Refresh'),
                                ),
                                const SizedBox(height: 8),
                                FilledButton.icon(
                                  onPressed: () => context.go('/scanning'),
                                  icon: const Icon(Icons.qr_code_scanner, size: 16),
                                  label: const Text('Scan Order'),
                                  style: FilledButton.styleFrom(
                                    backgroundColor: const Color(0xFF1E40AF),
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                  ),
                                ),
                              ],
                            )
                          else
                            Row(
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Orders Management',
                                        style: TextStyle(
                                          fontSize: 22,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF1E2329),
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '$totalCount total orders · showing ${filtered.length}',
                                        style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                                      ),
                                    ],
                                  ),
                                ),
                                OutlinedButton.icon(
                                  onPressed: fetchOrders,
                                  icon: const Icon(Icons.refresh, size: 16),
                                  label: const Text('Refresh'),
                                ),
                                const SizedBox(width: 10),
                                FilledButton.icon(
                                  onPressed: () => context.go('/scanning'),
                                  icon: const Icon(Icons.qr_code_scanner, size: 16),
                                  label: const Text('Scan Order'),
                                  style: FilledButton.styleFrom(
                                    backgroundColor: const Color(0xFF1E40AF),
                                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                                  ),
                                ),
                              ],
                            ),
                          const SizedBox(height: 20),

                          // Search + filters
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.grey.shade200),
                            ),
                            child: isMobile 
                              ? Column(
                                  children: [
                                    SizedBox(
                                      height: 42,
                                      child: TextField(
                                        controller: _searchCtrl,
                                        onChanged: (_) => _applyFilters(),
                                        decoration: InputDecoration(
                                          hintText: 'Search order #, AWB, customer…',
                                          hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                                          prefixIcon: Icon(Icons.search, size: 20, color: Colors.grey.shade400),
                                          filled: true,
                                          fillColor: Colors.grey.shade50,
                                          contentPadding: EdgeInsets.zero,
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(10),
                                            borderSide: BorderSide(color: Colors.grey.shade200),
                                          ),
                                          enabledBorder: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(10),
                                            borderSide: BorderSide(color: Colors.grey.shade200),
                                          ),
                                          focusedBorder: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(10),
                                            borderSide: BorderSide(color: Colors.blue.shade300),
                                          ),
                                        ),
                                        style: const TextStyle(fontSize: 13),
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                    Container(
                                      height: 42,
                                      width: double.infinity,
                                      padding: const EdgeInsets.symmetric(horizontal: 12),
                                      decoration: BoxDecoration(
                                        color: Colors.grey.shade50,
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: Colors.grey.shade200),
                                      ),
                                      child: DropdownButtonHideUnderline(
                                        child: DropdownButton<String>(
                                          value: statusFilter,
                                          isExpanded: true,
                                          items: statusFilters
                                              .map((s) => DropdownMenuItem(
                                                    value: s,
                                                    child: Text(s, style: const TextStyle(fontSize: 13)),
                                                  ))
                                              .toList(),
                                          onChanged: (v) {
                                            if (v == null) return;
                                            statusFilter = v;
                                            _applyFilters();
                                          },
                                        ),
                                      ),
                                    ),
                                  ],
                                )
                              : Row(
                                  children: [
                                    Expanded(
                                      child: SizedBox(
                                        height: 42,
                                        child: TextField(
                                          controller: _searchCtrl,
                                          onChanged: (_) => _applyFilters(),
                                          decoration: InputDecoration(
                                            hintText: 'Search order #, AWB, customer…',
                                            hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                                            prefixIcon: Icon(Icons.search, size: 20, color: Colors.grey.shade400),
                                            filled: true,
                                            fillColor: Colors.grey.shade50,
                                            contentPadding: EdgeInsets.zero,
                                            border: OutlineInputBorder(
                                              borderRadius: BorderRadius.circular(10),
                                              borderSide: BorderSide(color: Colors.grey.shade200),
                                            ),
                                            enabledBorder: OutlineInputBorder(
                                              borderRadius: BorderRadius.circular(10),
                                              borderSide: BorderSide(color: Colors.grey.shade200),
                                            ),
                                            focusedBorder: OutlineInputBorder(
                                              borderRadius: BorderRadius.circular(10),
                                              borderSide: BorderSide(color: Colors.blue.shade300),
                                            ),
                                          ),
                                          style: const TextStyle(fontSize: 13),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Container(
                                      height: 42,
                                      padding: const EdgeInsets.symmetric(horizontal: 12),
                                      decoration: BoxDecoration(
                                        color: Colors.grey.shade50,
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: Colors.grey.shade200),
                                      ),
                                      child: DropdownButtonHideUnderline(
                                        child: DropdownButton<String>(
                                          value: statusFilter,
                                          items: statusFilters
                                              .map((s) => DropdownMenuItem(
                                                    value: s,
                                                    child: Text(s, style: const TextStyle(fontSize: 13)),
                                                  ))
                                              .toList(),
                                          onChanged: (v) {
                                            if (v == null) return;
                                            statusFilter = v;
                                            _applyFilters();
                                          },
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                          ),
                          const SizedBox(height: 16),

                          // Table
                          Expanded(
                            child: Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.grey.shade200),
                              ),
                              child: filtered.isEmpty
                                  ? Center(
                                      child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(Icons.inbox_outlined, size: 48, color: Colors.grey.shade300),
                                          const SizedBox(height: 12),
                                          Text(
                                            orders.isEmpty
                                                ? 'No orders in database yet'
                                                : 'No orders match your filters',
                                            style: TextStyle(color: Colors.grey.shade600),
                                          ),
                                        ],
                                      ),
                                    )
                                  : SingleChildScrollView(
                                      child: SingleChildScrollView(
                                        scrollDirection: Axis.horizontal,
                                        child: DataTable(
                                          headingRowColor: WidgetStateProperty.all(Colors.grey.shade50),
                                          dataRowMinHeight: 52,
                                          dataRowMaxHeight: 56,
                                          columns: const [
                                            DataColumn(label: Text('Order ID', style: TextStyle(fontWeight: FontWeight.bold))),
                                            DataColumn(label: Text('AWB / Tracking', style: TextStyle(fontWeight: FontWeight.bold))),
                                            DataColumn(label: Text('Customer', style: TextStyle(fontWeight: FontWeight.bold))),
                                            DataColumn(label: Text('Marketplace', style: TextStyle(fontWeight: FontWeight.bold))),
                                            DataColumn(label: Text('Priority', style: TextStyle(fontWeight: FontWeight.bold))),
                                            DataColumn(label: Text('Status', style: TextStyle(fontWeight: FontWeight.bold))),
                                            DataColumn(label: Text('Date', style: TextStyle(fontWeight: FontWeight.bold))),
                                            DataColumn(label: Text('Action', style: TextStyle(fontWeight: FontWeight.bold))),
                                          ],
                                          rows: filtered.map((order) {
                                            final status = order['status'].toString();
                                            final color = _statusColor(status);
                                            return DataRow(cells: [
                                              DataCell(Text(
                                                order['orderNumber'].toString(),
                                                style: const TextStyle(fontWeight: FontWeight.w600),
                                              )),
                                              DataCell(Text(
                                                order['awb'].toString(),
                                                style: TextStyle(color: Colors.grey.shade600),
                                              )),
                                              DataCell(Text(order['customer'].toString())),
                                              DataCell(Text(order['marketplace'].toString())),
                                              DataCell(Text(order['priority'].toString())),
                                              DataCell(
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                  decoration: BoxDecoration(
                                                    color: color.withOpacity(0.12),
                                                    borderRadius: BorderRadius.circular(6),
                                                  ),
                                                  child: Text(
                                                    status,
                                                    style: TextStyle(
                                                      color: color,
                                                      fontSize: 11,
                                                      fontWeight: FontWeight.bold,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                              DataCell(Text(
                                                order['date'].toString(),
                                                style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                                              )),
                                              DataCell(
                                                TextButton(
                                                  onPressed: () {
                                                    // Future: order detail page
                                                    ScaffoldMessenger.of(context).showSnackBar(
                                                      SnackBar(
                                                        content: Text('Order ${order['orderNumber']}'),
                                                        behavior: SnackBarBehavior.floating,
                                                      ),
                                                    );
                                                  },
                                                  child: const Text('View'),
                                                ),
                                              ),
                                            ]);
                                          }).toList(),
                                        ),
                                      ),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }
                ),
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
            const Text('Could not load orders', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),
            Text(
              errorMessage ?? '',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: fetchOrders,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}
