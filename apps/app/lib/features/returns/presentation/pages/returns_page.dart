import 'package:flutter/material.dart';
import '../../../../shared/layout/app_layout.dart';

class ReturnsPage extends StatefulWidget {
  const ReturnsPage({super.key});

  @override
  State<ReturnsPage> createState() => _ReturnsPageState();
}

class _ReturnsPageState extends State<ReturnsPage> {
  final List<Map<String, dynamic>> returnsList = [
    {"returnId": "RET-20260516-001", "orderId": "ORD-202600516-001", "customer": "Rahul Enterprises", "reason": "Wrong Item", "status": "Pending", "date": "16 May 2026", "refund": "₹2,450"},
    {"returnId": "RET-20260516-002", "orderId": "ORD-202600516-002", "customer": "Sharma Traders", "reason": "Damaged Item", "status": "Pending", "date": "16 May 2026", "refund": "₹1,850"},
    {"returnId": "RET-20260516-003", "orderId": "ORD-202600516-003", "customer": "Kiran Stores", "reason": "Quantity Mismatch", "status": "Approved", "date": "15 May 2026", "refund": "₹3,120"},
    {"returnId": "RET-20260516-004", "orderId": "ORD-202600516-004", "customer": "Vikas Retail", "reason": "Not as Described", "status": "Approved", "date": "15 May 2026", "refund": "₹1,650"},
    {"returnId": "RET-20260516-005", "orderId": "ORD-202600516-005", "customer": "M/S Global Logistics", "reason": "Wrong Item", "status": "Rejected", "date": "15 May 2026", "refund": "₹0"},
  ];

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: "Returns",
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top 5 Metric Cards
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth > 1200;
                return Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  children: [
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Total Returns", "128", "+14.6% vs last week", Icons.assignment_return_outlined, Colors.blue)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Pending Returns", "32", "+18.7% vs last week", Icons.schedule, Colors.orange)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Completed Returns", "81", "+16.3% vs last week", Icons.check_circle_outline, Colors.green)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Rejected Returns", "15", "+7.1% vs last week", Icons.cancel_outlined, Colors.red)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Refund Amount", "₹1,24,560", "+12.4% vs last week", Icons.currency_rupee, Colors.purple)),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),

            // Middle Layout (Returns Table + Right Analytics Panel)
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth > 1100;
                return Flex(
                  direction: isWide ? Axis.horizontal : Axis.vertical,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Returns Table Section
                    Expanded(
                      flex: 7,
                      child: Card(
                        elevation: 0,
                        color: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text("Returns List", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                  FilledButton.icon(
                                    onPressed: () {},
                                    icon: const Icon(Icons.add, size: 16),
                                    label: const Text("Register Return"),
                                    style: FilledButton.styleFrom(backgroundColor: Colors.blue.shade700),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: DataTable(
                                  headingRowColor: WidgetStateProperty.all(Colors.grey.shade50),
                                  columns: const [
                                    DataColumn(label: Text("Return ID", style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text("Order ID", style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text("Customer", style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text("Reason", style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text("Status", style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text("Date", style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text("Refund", style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text("Actions", style: TextStyle(fontWeight: FontWeight.bold))),
                                  ],
                                  rows: returnsList.map((ret) {
                                    final status = ret["status"].toString();
                                    Color statusColor = Colors.blue;
                                    if (status == "Approved") statusColor = Colors.green;
                                    if (status == "Pending") statusColor = Colors.orange;
                                    if (status == "Rejected") statusColor = Colors.red;

                                    return DataRow(
                                      cells: [
                                        DataCell(Text(ret["returnId"].toString(), style: const TextStyle(fontWeight: FontWeight.bold))),
                                        DataCell(Text(ret["orderId"].toString())),
                                        DataCell(Text(ret["customer"].toString())),
                                        DataCell(Text(ret["reason"].toString())),
                                        DataCell(_badge(status, statusColor)),
                                        DataCell(Text(ret["date"].toString(), style: const TextStyle(color: Colors.grey))),
                                        DataCell(Text(ret["refund"].toString(), style: const TextStyle(fontWeight: FontWeight.bold))),
                                        DataCell(
                                          IconButton(icon: const Icon(Icons.visibility, size: 16, color: Colors.blue), onPressed: () {}),
                                        ),
                                      ],
                                    );
                                  }).toList(),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    if (isWide) const SizedBox(width: 24) else const SizedBox(height: 24),

                    // Right Return Analytics Panel
                    Expanded(
                      flex: 5,
                      child: Card(
                        elevation: 0,
                        color: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const Text("Return Overview", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 20),
                              Center(
                                child: Container(
                                  width: 140,
                                  height: 140,
                                  decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Colors.blue.shade600, width: 16)),
                                  child: const Center(
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text("128", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                                        Text("Total", style: TextStyle(color: Colors.grey, fontSize: 12)),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 20),
                              _statusLegend("Pending", "32 (25.0%)", Colors.orange),
                              const SizedBox(height: 8),
                              _statusLegend("Approved", "81 (63.3%)", Colors.green),
                              const SizedBox(height: 8),
                              _statusLegend("Rejected", "15 (11.7%)", Colors.red),
                              const SizedBox(height: 24),
                              const Text("Top Return Reasons", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              const SizedBox(height: 12),
                              _reasonBar("Wrong Item", 0.7, "48 (37.5%)"),
                              _reasonBar("Damaged Item", 0.5, "32 (25.0%)"),
                              _reasonBar("Quantity Mismatch", 0.35, "24 (18.8%)"),
                              const SizedBox(height: 24),
                              const Text("Refund Summary", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              const SizedBox(height: 12),
                              _detailRow("Total Refunds", "₹1,24,560"),
                              const Divider(height: 16),
                              _detailRow("Pending Refunds", "₹43,250"),
                              const Divider(height: 16),
                              _detailRow("Completed Refunds", "₹81,310"),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
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
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
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

  Widget _badge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
      child: Text(text, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }

  Widget _statusLegend(String label, String value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
        Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _reasonBar(String reason, double val, String count) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(reason, style: const TextStyle(fontSize: 12)),
              Text(count, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 4),
          LinearProgressIndicator(value: val, backgroundColor: Colors.grey.shade100, color: Colors.blue, minHeight: 6),
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87)),
      ],
    );
  }
}
