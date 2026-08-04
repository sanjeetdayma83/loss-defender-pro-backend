import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class AlertsPage extends StatefulWidget {
  const AlertsPage({super.key});

  @override
  State<AlertsPage> createState() => _AlertsPageState();
}

class _AlertsPageState extends State<AlertsPage> {
  final Dio _dio = ApiClient.dio;

  bool isLoading = true;
  String? errorMessage;
  int selectedTab = 0;
  int selectedAlertIndex = 0;

  List<Map<String, dynamic>> alertsList = [];
  int totalAlerts = 0;
  int highPriority = 0;
  int mediumPriority = 0;
  int resolvedAlerts = 0;

  @override
  void initState() {
    super.initState();
    fetchAlerts();
  }

  List<dynamic> _extractItems(dynamic body) {
    if (body is List) return body;
    if (body is! Map) return [];
    final map = Map<String, dynamic>.from(body);
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

  Future<void> fetchAlerts() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final response = await _dio.get(ApiEndpoints.alerts);
      final items = _extractItems(response.data);

      final mapped = items.map<Map<String, dynamic>>((e) {
        final m = Map<String, dynamic>.from(e as Map);
        return {
          "alert": (m["alert"] ?? m["type"] ?? "Alert").toString(),
          "desc": (m["desc"] ?? m["description"] ?? "").toString(),
          "orderId": (m["orderId"] ?? m["orderNumber"] ?? "—").toString(),
          "type": (m["type"] ?? "System").toString(),
          "priority": (m["priority"] ?? "Medium").toString(),
          "time": _formatTime(m["time"] ?? m["createdAt"] ?? m["updatedAt"]),
          "status": (m["status"] ?? "Open").toString(),
          "user": (m["user"] ?? "System").toString(),
          "warehouse": (m["warehouse"] ?? "—").toString(),
          "device": (m["device"] ?? "—").toString(),
        };
      }).toList();

      setState(() {
        alertsList = mapped;
        totalAlerts = mapped.length;
        highPriority = mapped.where((a) => (a["priority"] as String).toLowerCase() == "high").length;
        mediumPriority = mapped.where((a) => (a["priority"] as String).toLowerCase() == "medium").length;
        resolvedAlerts = mapped.where((a) => (a["status"] as String).toLowerCase() == "closed" || (a["status"] as String).toLowerCase() == "resolved").length;
        selectedAlertIndex = 0;
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
        alertsList = [];
        totalAlerts = 0;
        highPriority = 0;
        mediumPriority = 0;
        resolvedAlerts = 0;
      });
    }
  }

  String _formatTime(dynamic raw) {
    if (raw == null) return "—";
    try {
      final dt = DateTime.parse(raw.toString()).toLocal();
      return "${dt.day.toString().padLeft(2, '0')} ${_month(dt.month)} ${dt.year}, ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}";
    } catch (_) {
      return raw.toString();
    }
  }

  String _month(int m) {
    const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[m];
  }

  List<Map<String, dynamic>> get filteredAlerts {
    if (selectedTab == 1) return alertsList.where((a) => (a["priority"] as String).toLowerCase() == "high").toList();
    if (selectedTab == 2) return alertsList.where((a) => (a["priority"] as String).toLowerCase() == "medium").toList();
    if (selectedTab == 3) return alertsList.where((a) => (a["status"] as String).toLowerCase() == "closed" || (a["status"] as String).toLowerCase() == "resolved").toList();
    return alertsList;
  }

  @override
  Widget build(BuildContext context) {
    final list = filteredAlerts;
    final currentAlert = list.isNotEmpty && selectedAlertIndex < list.length ? list[selectedAlertIndex] : null;

    return AppLayout(
      title: "Alerts",
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : LayoutBuilder(
              builder: (context, constraints) {
                final isMobile = constraints.maxWidth < 900;

                return SingleChildScrollView(
                  padding: EdgeInsets.all(isMobile ? 16.0 : 32.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Metric cards
                      Wrap(
                        spacing: 16,
                        runSpacing: 16,
                        children: [
                          _metricCard("Total Alerts", totalAlerts.toString(), Icons.warning_amber_rounded, Colors.red),
                          _metricCard("High Priority", highPriority.toString(), Icons.notifications_active, Colors.orange),
                          _metricCard("Medium Priority", mediumPriority.toString(), Icons.info_outline, Colors.amber),
                          _metricCard("Resolved Alerts", resolvedAlerts.toString(), Icons.check_circle_outline, Colors.green),
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
                              TextButton(onPressed: fetchAlerts, child: const Text("Retry")),
                            ],
                          ),
                        ),

                      if (alertsList.isEmpty && errorMessage == null)
                        Container(
                          padding: const EdgeInsets.all(48),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Column(
                            children: [
                              Icon(Icons.notifications_none, size: 48, color: Colors.grey.shade400),
                              const SizedBox(height: 16),
                              Text("No alerts right now", style: TextStyle(fontSize: 16, color: Colors.grey.shade600)),
                              const SizedBox(height: 8),
                              Text("High-priority, returns and claims will appear here automatically.", style: TextStyle(fontSize: 13, color: Colors.grey.shade500)),
                            ],
                          ),
                        )
                      else if (alertsList.isNotEmpty)
                        isMobile
                            ? _buildMobileList(list, currentAlert)
                            : _buildDesktopLayout(list, currentAlert),
                    ],
                  ),
                );
              },
            ),
    );
  }

  Widget _metricCard(String title, String value, IconData icon, Color color) {
    return SizedBox(
      width: 220,
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(title, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                  Icon(icon, color: color, size: 22),
                ],
              ),
              const SizedBox(height: 8),
              Text(value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDesktopLayout(List<Map<String, dynamic>> list, Map<String, dynamic>? current) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 3,
          child: Card(
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      _tab("All Alerts ($totalAlerts)", 0),
                      _tab("High ($highPriority)", 1),
                      _tab("Medium ($mediumPriority)", 2),
                      _tab("Resolved ($resolvedAlerts)", 3),
                      const Spacer(),
                      IconButton(onPressed: fetchAlerts, icon: const Icon(Icons.refresh), tooltip: "Refresh"),
                    ],
                  ),
                ),
                const Divider(height: 1),
                ...List.generate(list.length, (i) {
                  final a = list[i];
                  final selected = i == selectedAlertIndex;
                  return InkWell(
                    onTap: () => setState(() => selectedAlertIndex = i),
                    child: Container(
                      color: selected ? Colors.blue.shade50 : null,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: Row(
                        children: [
                          Icon(
                            selected ? Icons.check_box : Icons.check_box_outline_blank,
                            size: 20,
                            color: selected ? Colors.blue : Colors.grey,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(a["alert"] ?? "", style: const TextStyle(fontWeight: FontWeight.w600)),
                                Text(a["desc"] ?? "", style: TextStyle(fontSize: 12, color: Colors.grey.shade600), maxLines: 1, overflow: TextOverflow.ellipsis),
                              ],
                            ),
                          ),
                          Text(a["orderId"] ?? "", style: const TextStyle(fontSize: 12)),
                          const SizedBox(width: 12),
                          _priorityChip(a["priority"] ?? ""),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          flex: 2,
          child: current == null
              ? const SizedBox()
              : Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text("Alert Details", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            _priorityChip(current["priority"] ?? ""),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(current["alert"] ?? "", style: TextStyle(color: Colors.red.shade800, fontWeight: FontWeight.bold)),
                              Text(current["desc"] ?? "", style: TextStyle(color: Colors.red.shade700, fontSize: 13)),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        _detailRow("Order ID", current["orderId"]),
                        _detailRow("Type", current["type"]),
                        _detailRow("Scanned By", current["user"]),
                        _detailRow("Warehouse", current["warehouse"]),
                        _detailRow("Time", current["time"]),
                        _detailRow("Device", current["device"]),
                        _detailRow("Status", current["status"]),
                      ],
                    ),
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildMobileList(List<Map<String, dynamic>> list, Map<String, dynamic>? current) {
    return Column(
      children: list.map((a) {
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            title: Text(a["alert"] ?? "", style: const TextStyle(fontWeight: FontWeight.w600)),
            subtitle: Text("${a["orderId"]} • ${a["desc"]}"),
            trailing: _priorityChip(a["priority"] ?? ""),
          ),
        );
      }).toList(),
    );
  }

  Widget _tab(String label, int index) {
    final selected = selectedTab == index;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: TextButton(
        onPressed: () => setState(() {
          selectedTab = index;
          selectedAlertIndex = 0;
        }),
        style: TextButton.styleFrom(
          foregroundColor: selected ? Colors.blue : Colors.grey.shade700,
          backgroundColor: selected ? Colors.blue.shade50 : null,
        ),
        child: Text(label, style: TextStyle(fontWeight: selected ? FontWeight.bold : FontWeight.normal)),
      ),
    );
  }

  Widget _priorityChip(String priority) {
    final isHigh = priority.toLowerCase() == "high";
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isHigh ? Colors.red.shade50 : Colors.orange.shade50,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        priority,
        style: TextStyle(
          color: isHigh ? Colors.red.shade700 : Colors.orange.shade800,
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _detailRow(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
          Text((value ?? "—").toString(), style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13)),
        ],
      ),
    );
  }
}
