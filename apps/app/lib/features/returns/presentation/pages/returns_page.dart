import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class ReturnsPage extends StatefulWidget {
  const ReturnsPage({super.key});

  @override
  State<ReturnsPage> createState() => _ReturnsPageState();
}

class _ReturnsPageState extends State<ReturnsPage> {
  final Dio _dio = ApiClient.dio;
  bool isLoading = true;
  String? errorMessage;
  List<Map<String, dynamic>> returnsList = [];

  @override
  void initState() {
    super.initState();
    fetchReturns();
  }

  List<dynamic> _extractItems(dynamic body) {
    if (body is List) return body;
    if (body is! Map) return [];
    final map = Map<String, dynamic>.from(body);
    // ResponseInterceptor wraps: { success, data: { items: [...] } }
    final data = map['data'];
    if (data is List) return data;
    if (data is Map) {
      final inner = Map<String, dynamic>.from(data);
      if (inner['items'] is List) return inner['items'] as List;
      if (inner['data'] is List) return inner['data'] as List;
    }
    if (map['items'] is List) return map['items'] as List;
    return [];
  }

  Future<void> fetchReturns() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final response = await _dio.get(ApiEndpoints.returns);
      final items = _extractItems(response.data);

      setState(() {
        returnsList = items.map<Map<String, dynamic>>((e) {
          final m = Map<String, dynamic>.from(e as Map);
          return {
            "id": (m["id"] ?? m["returnId"] ?? "—").toString(),
            "orderId": (m["orderNumber"] ?? m["orderId"] ?? m["id"] ?? "—").toString(),
            "customer": (m["customerName"] ?? m["customer"]?["name"] ?? m["customer"] ?? "—").toString(),
            "reason": (m["reason"] ?? m["notes"] ?? m["exceptionReason"] ?? m["issue"] ?? "Return requested").toString(),
            "status": (m["status"] ?? "RETURNED").toString(),
            "date": _formatDate(m["createdAt"] ?? m["updatedAt"] ?? m["date"]),
          };
        }).toList();
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = e is DioException
            ? (e.response?.data is Map
                ? (e.response!.data['message']?.toString() ?? e.message)
                : e.message)
            : e.toString();
        returnsList = []; // No fake data
      });
    }
  }

  String _formatDate(dynamic raw) {
    if (raw == null) return "—";
    try {
      final dt = DateTime.parse(raw.toString()).toLocal();
      return "${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}";
    } catch (_) {
      return raw.toString().length >= 10 ? raw.toString().substring(0, 10) : raw.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: "Returns & Exception Management",
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : LayoutBuilder(
              builder: (context, constraints) {
                final isMobile = constraints.maxWidth < 800;

                return SingleChildScrollView(
                  padding: EdgeInsets.all(isMobile ? 16.0 : 32.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Returned & Discrepant Orders",
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "Live data from /returns API",
                                style: TextStyle(color: Colors.grey[600], fontSize: 13),
                              ),
                            ],
                          ),
                          FilledButton.icon(
                            onPressed: fetchReturns,
                            icon: const Icon(Icons.sync, size: 18),
                            label: const Text("Sync Returns API"),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      if (errorMessage != null)
                        Container(
                          padding: const EdgeInsets.all(16),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.red.shade200),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.error_outline, color: Colors.red.shade700),
                              const SizedBox(width: 12),
                              Expanded(child: Text(errorMessage!, style: TextStyle(color: Colors.red.shade800))),
                              TextButton(onPressed: fetchReturns, child: const Text("Retry")),
                            ],
                          ),
                        ),

                      if (returnsList.isEmpty && errorMessage == null)
                        Container(
                          padding: const EdgeInsets.all(48),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Column(
                            children: [
                              Icon(Icons.assignment_return_outlined, size: 48, color: Colors.grey.shade400),
                              const SizedBox(height: 16),
                              Text("No returns found", style: TextStyle(fontSize: 16, color: Colors.grey.shade600)),
                              const SizedBox(height: 8),
                              Text("When orders are marked RETURNED they will appear here.", style: TextStyle(fontSize: 13, color: Colors.grey.shade500)),
                            ],
                          ),
                        )
                      else if (returnsList.isNotEmpty)
                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: DataTable(
                              headingRowColor: WidgetStateProperty.all(Colors.grey.shade50),
                              columns: const [
                                DataColumn(label: Text("Return ID")),
                                DataColumn(label: Text("Order ID")),
                                DataColumn(label: Text("Customer Name")),
                                DataColumn(label: Text("Return Reason / Issue")),
                                DataColumn(label: Text("Status")),
                                DataColumn(label: Text("Date")),
                              ],
                              rows: returnsList.map((r) {
                                return DataRow(cells: [
                                  DataCell(Text(r["id"] ?? "—", style: const TextStyle(fontWeight: FontWeight.w600))),
                                  DataCell(Text(r["orderId"] ?? "—")),
                                  DataCell(Text(r["customer"] ?? "—")),
                                  DataCell(Text(r["reason"] ?? "—")),
                                  DataCell(_statusChip(r["status"] ?? "")),
                                  DataCell(Text(r["date"] ?? "—")),
                                ]);
                              }).toList(),
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

  Widget _statusChip(String status) {
    Color bg;
    Color fg;
    final s = status.toUpperCase();
    if (s.contains("APPROVED") || s.contains("COMPLETED") || s.contains("REFUND")) {
      bg = Colors.green.shade50; fg = Colors.green.shade700;
    } else if (s.contains("PENDING") || s.contains("INSPECTION") || s.contains("AUDIT")) {
      bg = Colors.blue.shade50; fg = Colors.blue.shade700;
    } else {
      bg = Colors.orange.shade50; fg = Colors.orange.shade800;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
      child: Text(status, style: TextStyle(color: fg, fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }
}
