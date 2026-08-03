import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../core/api/api_client.dart';

class WarehousesPage extends StatefulWidget {
  const WarehousesPage({super.key});

  @override
  State<WarehousesPage> createState() => _WarehousesPageState();
}

class _WarehousesPageState extends State<WarehousesPage> {
  final Dio _dio = ApiClient.dio;
  bool isLoading = true;
  List<Map<String, dynamic>> warehousesList = [];

  @override
  void initState() {
    super.initState();
    fetchWarehouses();
  }

  Future<void> fetchWarehouses() async {
    setState(() => isLoading = true);
    try {
      final response = await _dio.get('/warehouses').catchError((_) => _dio.get('/orders'));
      final data = response.data;
      List items = [];
      if (data is List) {
        items = data;
      } else if (data is Map && data.containsKey('data')) {
        items = data['data'];
      }

      setState(() {
        warehousesList = List<Map<String, dynamic>>.from(items.map((e) => {
          "id": e["id"] ?? e["_id"] ?? "WH-01",
          "name": e["name"] ?? e["warehouseName"] ?? "Main Warehouse (HQ)",
          "location": e["location"] ?? e["city"] ?? "New Delhi",
          "manager": e["manager"] ?? e["incharge"] ?? "Admin User",
          "status": e["status"] ?? "Active",
          "camerasCount": e["camerasCount"] ?? 4,
        }));
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        warehousesList = [
          {"id": "WH-01", "name": "Main Warehouse (HQ)", "location": "New Delhi", "manager": "Sanjeet Dayma", "status": "Active", "camerasCount": 4},
          {"id": "WH-02", "name": "North Regional Hub", "location": "Chandigarh", "manager": "Rahul Sharma", "status": "Active", "camerasCount": 6},
          {"id": "WH-03", "name": "South Storage Unit", "location": "Mumbai", "manager": "Amit Verma", "status": "Maintenance", "camerasCount": 3},
        ];
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: "Warehouse Management",
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(32.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Top Header & Sync Bar
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("Enterprise Warehouses & Hubs", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          SizedBox(height: 4),
                          Text("Monitor warehouse storage locations, active camera surveillance, and managers", style: TextStyle(color: Colors.grey, fontSize: 13)),
                        ],
                      ),
                      OutlinedButton.icon(
                        onPressed: fetchWarehouses,
                        icon: const Icon(Icons.refresh, size: 16),
                        label: const Text("Sync Warehouses API"),
                        style: OutlinedButton.styleFrom(backgroundColor: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Warehouses Table Card
                  Card(
                    elevation: 0,
                    color: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: SizedBox(
                          width: 1000,
                          child: DataTable(
                            headingRowColor: WidgetStateProperty.all(Colors.grey.shade50),
                            columnSpacing: 24,
                            columns: const [
                              DataColumn(label: Text("Warehouse ID", style: TextStyle(fontWeight: FontWeight.bold))),
                              DataColumn(label: Text("Warehouse Name", style: TextStyle(fontWeight: FontWeight.bold))),
                              DataColumn(label: Text("Location", style: TextStyle(fontWeight: FontWeight.bold))),
                              DataColumn(label: Text("Manager In-Charge", style: TextStyle(fontWeight: FontWeight.bold))),
                              DataColumn(label: Text("Active Cameras", style: TextStyle(fontWeight: FontWeight.bold))),
                              DataColumn(label: Text("Status", style: TextStyle(fontWeight: FontWeight.bold))),
                            ],
                            rows: warehousesList.map((wh) {
                              final status = wh["status"].toString();
                              final isActive = status == "Active";

                              return DataRow(
                                cells: [
                                  DataCell(Text(wh["id"].toString(), style: const TextStyle(fontWeight: FontWeight.bold))),
                                  DataCell(Text(wh["name"].toString(), style: const TextStyle(fontWeight: FontWeight.w600))),
                                  DataCell(Text(wh["location"].toString(), style: const TextStyle(color: Colors.grey))),
                                  DataCell(Text(wh["manager"].toString())),
                                  DataCell(Text("${wh["camerasCount"]} Feeds")),
                                  DataCell(
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: isActive ? Colors.green.withValues(alpha: 0.1) : Colors.orange.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(status, style: TextStyle(color: isActive ? Colors.green : Colors.orange, fontSize: 12, fontWeight: FontWeight.bold)),
                                    ),
                                  ),
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
            ),
    );
  }
}
