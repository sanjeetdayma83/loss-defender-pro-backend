import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../core/api/api_client.dart';

class ReturnsPage extends StatefulWidget {
  const ReturnsPage({super.key});

  @override
  State<ReturnsPage> createState() => _ReturnsPageState();
}

class _ReturnsPageState extends State<ReturnsPage> {
  final Dio _dio = ApiClient.dio;
  bool isLoading = true;
  List<Map<String, dynamic>> returnsList = [];

  @override
  void initState() {
    super.initState();
    fetchReturns();
  }

  Future<void> fetchReturns() async {
    setState(() => isLoading = true);
    try {
      final response = await _dio.get('/returns').catchError((_) => _dio.get('/orders'));
      final data = response.data;
      List items = [];
      if (data is List) {
        items = data;
      } else if (data is Map && data.containsKey('data')) {
        items = data['data'];
      }

      setState(() {
        returnsList = List<Map<String, dynamic>>.from(items.map((e) => {
          "id": e["id"] ?? e["returnId"] ?? "RET-001",
          "orderId": e["orderId"] ?? "ORD-2026-001",
          "customer": e["customerName"] ?? e["customer"] ?? "Enterprise Client",
          "reason": e["reason"] ?? e["issue"] ?? "Damaged Packaging / Wrong Weight",
          "status": e["status"] ?? "Pending Inspection",
          "date": e["createdAt"]?.toString().substring(0, 10) ?? "2026-08-03",
        }));
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        returnsList = [
          {"id": "RET-001", "orderId": "ORD-2026-012", "customer": "Shri Balaji Trading Co.", "reason": "Torn Tarpaulin Sheet", "status": "Under Audit", "date": "2026-08-01"},
          {"id": "RET-002", "orderId": "ORD-2026-018", "customer": "Sharma Logistics", "reason": "Shortage in Cargo Net Count", "status": "Approved Refund", "date": "2026-08-02"},
          {"id": "RET-003", "orderId": "ORD-2026-025", "customer": "Vikas Enterprises", "reason": "Wrong Item Dispatched", "status": "Pending Inspection", "date": "2026-08-03"},
        ];
        isLoading = false;
      });
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
                final isMobile = constraints.maxWidth < 650;

                return SingleChildScrollView(
                  padding: EdgeInsets.all(isMobile ? 16.0 : 32.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Top Header & Sync Bar
                      if (isMobile)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              "Returned & Discrepant Orders",
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              "Audit return claims and verify video proof against packaging discrepancies",
                              style: TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton.icon(
                                onPressed: fetchReturns,
                                icon: const Icon(Icons.refresh, size: 16),
                                label: const Text("Sync Returns API"),
                                style: OutlinedButton.styleFrom(backgroundColor: Colors.white),
                              ),
                            ),
                          ],
                        )
                      else
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text("Returned & Discrepant Orders", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                                SizedBox(height: 4),
                                Text("Audit return claims and verify video proof against packaging discrepancies", style: TextStyle(color: Colors.grey, fontSize: 13)),
                              ],
                            ),
                            OutlinedButton.icon(
                              onPressed: fetchReturns,
                              icon: const Icon(Icons.refresh, size: 16),
                              label: const Text("Sync Returns API"),
                              style: OutlinedButton.styleFrom(backgroundColor: Colors.white),
                            ),
                          ],
                        ),
                      const SizedBox(height: 24),

                      // Returns Table Card
                      Card(
                        elevation: 0,
                        color: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                        child: Padding(
                          padding: EdgeInsets.all(isMobile ? 12.0 : 20.0),
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: SizedBox(
                              width: 900,
                              child: DataTable(
                                headingRowColor: WidgetStateProperty.all(Colors.grey.shade50),
                                columnSpacing: 20,
                                columns: const [
                                  DataColumn(label: Text("Return ID", style: TextStyle(fontWeight: FontWeight.bold))),
                                  DataColumn(label: Text("Order ID", style: TextStyle(fontWeight: FontWeight.bold))),
                                  DataColumn(label: Text("Customer Name", style: TextStyle(fontWeight: FontWeight.bold))),
                                  DataColumn(label: Text("Return Reason / Issue", style: TextStyle(fontWeight: FontWeight.bold))),
                                  DataColumn(label: Text("Status", style: TextStyle(fontWeight: FontWeight.bold))),
                                  DataColumn(label: Text("Date", style: TextStyle(fontWeight: FontWeight.bold))),
                                ],
                                rows: returnsList.map((ret) {
                                  final status = ret["status"].toString();
                                  Color statusColor = Colors.orange;
                                  if (status.contains("Approved") || status.contains("Resolved")) statusColor = Colors.green;
                                  if (status.contains("Under") || status.contains("Pending")) statusColor = Colors.blue;

                                  return DataRow(
                                    cells: [
                                      DataCell(Text(ret["id"].toString(), style: const TextStyle(fontWeight: FontWeight.bold))),
                                      DataCell(Text(ret["orderId"].toString(), style: const TextStyle(color: Colors.grey))),
                                      DataCell(Text(ret["customer"].toString())),
                                      DataCell(Text(ret["reason"].toString())),
                                      DataCell(
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                                          child: Text(status, style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold)),
                                        ),
                                      ),
                                      DataCell(Text(ret["date"].toString(), style: const TextStyle(color: Colors.grey))),
                                    ],
                                  );
                                }).toList(),
                              ),
                            ),
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
}
