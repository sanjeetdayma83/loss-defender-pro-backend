import 'package:flutter/material.dart';
import '../../../../shared/layout/app_layout.dart';

class AlertsPage extends StatefulWidget {
  const AlertsPage({super.key});

  @override
  State<AlertsPage> createState() => _AlertsPageState();
}

class _AlertsPageState extends State<AlertsPage> {
  int selectedTab = 0;
  int selectedAlertIndex = 0;

  final List<Map<String, dynamic>> alertsList = [
    {"alert": "Duplicate Scan Detected", "desc": "Same barcode scanned multiple times", "orderId": "ORD-202600516-001", "type": "Scanning", "priority": "High", "time": "16 May 2026, 10:32 AM", "status": "Open", "user": "Rahul Sharma", "warehouse": "Main Warehouse", "device": "LD-Scanner-01"},
    {"alert": "Unusual Activity Detected", "desc": "Unusual scanning pattern identified", "orderId": "ORD-202600516-002", "type": "AI Detection", "priority": "High", "time": "16 May 2026, 10:28 AM", "status": "Open", "user": "Vikram Singh", "warehouse": "Main Warehouse", "device": "LD-Scanner-02"},
    {"alert": "Order Verification Pending", "desc": "Order pending for manual verification", "orderId": "ORD-202600516-003", "type": "Verification", "priority": "Medium", "time": "16 May 2026, 10:24 AM", "status": "In Progress", "user": "Neha Verma", "warehouse": "Main Warehouse", "device": "LD-Scanner-03"},
    {"alert": "Recording Not Available", "desc": "Recording missing for this scan", "orderId": "ORD-202600516-004", "type": "Recording", "priority": "High", "time": "16 May 2026, 10:20 AM", "status": "Open", "user": "Amit Kumar", "warehouse": "Main Warehouse", "device": "LD-Cam-01"},
    {"alert": "Item Quantity Mismatch", "desc": "Scanned quantity does not match order", "orderId": "ORD-202600516-005", "type": "Verification", "priority": "Medium", "time": "16 May 2026, 10:15 AM", "status": "Open", "user": "Pooja Sharma", "warehouse": "Main Warehouse", "device": "LD-Scanner-04"},
  ];

  @override
  Widget build(BuildContext context) {
    final currentAlert = alertsList[selectedAlertIndex];

    return AppLayout(
      title: "Alerts",
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isMobile = constraints.maxWidth < 800;
          final isWide = constraints.maxWidth > 1100;
          
          return SingleChildScrollView(
            padding: EdgeInsets.all(isMobile ? 16.0 : 32.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top 4 Metric Cards
                Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  children: [
                    SizedBox(width: isWide ? (constraints.maxWidth - 48) / 4 : (isMobile ? double.infinity : (constraints.maxWidth - 16) / 2), child: _buildStatCard("Total Alerts", "164", "+18.7% vs last week", Icons.warning_amber_rounded, Colors.red)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 48) / 4 : (isMobile ? double.infinity : (constraints.maxWidth - 16) / 2), child: _buildStatCard("High Priority", "38", "+22.4% vs last week", Icons.notifications_active, Colors.orange)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 48) / 4 : (isMobile ? double.infinity : (constraints.maxWidth - 16) / 2), child: _buildStatCard("Medium Priority", "86", "-5.3% vs last week", Icons.info_outline, Colors.amber.shade800)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 48) / 4 : (isMobile ? double.infinity : (constraints.maxWidth - 16) / 2), child: _buildStatCard("Resolved Alerts", "124", "+16.1% vs last week", Icons.check_circle_outline, Colors.green)),
                  ],
                ),
                const SizedBox(height: 24),

                // Main Content Layout (Table + Right Details Panel)
                if (isWide)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 7, child: _buildTableCard(isMobile)),
                      const SizedBox(width: 24),
                      Expanded(flex: 5, child: _buildDetailsCard(currentAlert, isMobile)),
                    ],
                  )
                else
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _buildTableCard(isMobile),
                      const SizedBox(height: 24),
                      _buildDetailsCard(currentAlert, isMobile),
                    ],
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildTableCard(bool isMobile) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: EdgeInsets.all(isMobile ? 16.0 : 20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Tabs
            Wrap(
              spacing: 16,
              runSpacing: 12,
              children: [
                _buildTab("All Alerts (164)", 0),
                _buildTab("High (38)", 1),
                _buildTab("Medium (86)", 2),
                _buildTab("Resolved (124)", 3),
              ],
            ),
            const Divider(height: 24),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                headingRowColor: WidgetStateProperty.all(Colors.grey.shade50),
                columnSpacing: isMobile ? 16 : 24,
                columns: const [
                  DataColumn(label: Text("Alert", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Order ID", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Type", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Priority", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Time", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Status", style: TextStyle(fontWeight: FontWeight.bold))),
                ],
                rows: List.generate(alertsList.length, (index) {
                  final alert = alertsList[index];
                  final isSelected = selectedAlertIndex == index;
                  final priority = alert["priority"].toString();
                  final status = alert["status"].toString();

                  return DataRow(
                    selected: isSelected,
                    onSelectChanged: (val) => setState(() => selectedAlertIndex = index),
                    cells: [
                      DataCell(Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(alert["alert"].toString(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          Text(alert["desc"].toString(), style: const TextStyle(color: Colors.grey, fontSize: 11)),
                        ],
                      )),
                      DataCell(Text(alert["orderId"].toString())),
                      DataCell(Text(alert["type"].toString())),
                      DataCell(_badge(priority, priority == "High" ? Colors.red : Colors.orange)),
                      DataCell(Text(alert["time"].toString(), style: const TextStyle(fontSize: 12, color: Colors.grey))),
                      DataCell(_badge(status, status == "Open" ? Colors.red : Colors.blue)),
                    ],
                  );
                }),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailsCard(Map<String, dynamic> currentAlert, bool isMobile) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: EdgeInsets.all(isMobile ? 16.0 : 20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Alert Details", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                _badge(currentAlert["priority"].toString(), Colors.red),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.red.shade100)),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, color: Colors.red),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(currentAlert["alert"].toString(), style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red, fontSize: 14)),
                        Text(currentAlert["desc"].toString(), style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
                      ],
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 16),
            _detailRow("Order ID", currentAlert["orderId"].toString()),
            const Divider(height: 16),
            _detailRow("Barcode / QR Code", "8901234567890"),
            const Divider(height: 16),
            _detailRow("Scanned By", currentAlert["user"].toString()),
            const Divider(height: 16),
            _detailRow("Warehouse", currentAlert["warehouse"].toString()),
            const Divider(height: 16),
            _detailRow("Scan Time", currentAlert["time"].toString()),
            const Divider(height: 16),
            _detailRow("Device", currentAlert["device"].toString()),
            const SizedBox(height: 16),
            const Text("Evidence", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 8),
            Container(
              height: 160,
              decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(8)),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Icon(Icons.videocam, color: Colors.white.withOpacity(0.3), size: 48),
                  const Icon(Icons.play_circle_fill, color: Colors.white, size: 48),
                ],
              ),
            ),
            const SizedBox(height: 20),
            if (isMobile)
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.check, size: 16, color: Colors.green),
                    label: const Text("Mark as Resolved"),
                    style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.green), padding: const EdgeInsets.symmetric(vertical: 14)),
                  ),
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.person_add, size: 16),
                    label: const Text("Assign"),
                    style: FilledButton.styleFrom(backgroundColor: Colors.blue.shade700, padding: const EdgeInsets.symmetric(vertical: 14)),
                  ),
                ],
              )
            else
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.check, size: 16, color: Colors.green),
                      label: const Text("Mark as Resolved"),
                      style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.green)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.person_add, size: 16),
                      label: const Text("Assign"),
                      style: FilledButton.styleFrom(backgroundColor: Colors.blue.shade700),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, String sub, IconData icon, Color color) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w500)),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: Icon(icon, color: color, size: 20),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(sub, style: TextStyle(color: sub.contains("+") ? Colors.green : Colors.grey, fontSize: 11, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _buildTab(String label, int index) {
    final isActive = selectedTab == index;
    return GestureDetector(
      onTap: () => setState(() => selectedTab = index),
      child: Column(
        children: [
          Text(label, style: TextStyle(fontWeight: isActive ? FontWeight.bold : FontWeight.w500, color: isActive ? Colors.blue.shade700 : Colors.grey)),
          const SizedBox(height: 4),
          if (isActive) Container(height: 2, width: 40, color: Colors.blue.shade700),
        ],
      ),
    );
  }

  Widget _badge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
      child: Text(text, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }

  Widget _detailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: Colors.black87)),
      ],
    );
  }
}
