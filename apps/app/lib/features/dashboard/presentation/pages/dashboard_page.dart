import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/layout/app_layout.dart';
import '../providers/dashboard_provider.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardState = ref.watch(dashboardProvider);
    final stats = dashboardState.stats;

    return AppLayout(
      title: "Dashboard",
      child: dashboardState.loading && stats.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Welcome Header with Date Selector & Search
                  _buildHeader(context),
                  const SizedBox(height: 24),

                  // Top 4 Stat Cards
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final isWide = constraints.maxWidth > 1100;
                      return Wrap(
                        spacing: 16,
                        runSpacing: 16,
                        children: [
                          SizedBox(
                            width: isWide ? (constraints.maxWidth - 48) / 4 : (constraints.maxWidth > 600 ? (constraints.maxWidth - 16) / 2 : double.infinity),
                            child: _buildStatCard("Total Orders", stats["totalOrders"]?.toString() ?? "1,248", stats["totalOrdersGrowth"] ?? "+18.6% vs last week", Icons.shopping_bag_outlined, Colors.blue, true),
                          ),
                          SizedBox(
                            width: isWide ? (constraints.maxWidth - 48) / 4 : (constraints.maxWidth > 600 ? (constraints.maxWidth - 16) / 2 : double.infinity),
                            child: _buildStatCard("Verified Orders", stats["verifiedOrders"]?.toString() ?? "1,136", stats["verifiedGrowth"] ?? "+14.4% vs last week", Icons.check_circle_outline, Colors.green, true),
                          ),
                          SizedBox(
                            width: isWide ? (constraints.maxWidth - 48) / 4 : (constraints.maxWidth > 600 ? (constraints.maxWidth - 16) / 2 : double.infinity),
                            child: _buildStatCard("Pending Orders", stats["pendingOrders"]?.toString() ?? "112", stats["pendingGrowth"] ?? "-6.3% vs last week", Icons.schedule, Colors.orange, false),
                          ),
                          SizedBox(
                            width: isWide ? (constraints.maxWidth - 48) / 4 : (constraints.maxWidth > 600 ? (constraints.maxWidth - 16) / 2 : double.infinity),
                            child: _buildStatCard("Exceptions", stats["exceptions"]?.toString() ?? "23", stats["exceptionsGrowth"] ?? "+15.8% vs last week", Icons.warning_amber_rounded, Colors.red, true),
                          ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 24),

                  // Charts Row (Verification Overview & Orders by Status)
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final isWide = constraints.maxWidth > 1000;
                      return Flex(
                        direction: isWide ? Axis.horizontal : Axis.vertical,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            flex: 7,
                            child: _buildVerificationOverviewCard(),
                          ),
                          if (isWide) const SizedBox(width: 24) else const SizedBox(height: 24),
                          Expanded(
                            flex: 5,
                            child: _buildOrdersByStatusCard(),
                          ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 24),

                  // 4 Metric Highlight Cards
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final isWide = constraints.maxWidth > 1100;
                      return Wrap(
                        spacing: 16,
                        runSpacing: 16,
                        children: [
                          SizedBox(
                            width: isWide ? (constraints.maxWidth - 48) / 4 : (constraints.maxWidth > 600 ? (constraints.maxWidth - 16) / 2 : double.infinity),
                            child: _buildMetricCard("Today's Scans", stats["todayScans"]?.toString() ?? "342", "+12.5% vs yesterday", Icons.qr_code_scanner, Colors.blue),
                          ),
                          SizedBox(
                            width: isWide ? (constraints.maxWidth - 48) / 4 : (constraints.maxWidth > 600 ? (constraints.maxWidth - 16) / 2 : double.infinity),
                            child: _buildMetricCard("AI Detections", stats["aiDetections"]?.toString() ?? "18", "+20.0% vs yesterday", Icons.auto_awesome, Colors.purple),
                          ),
                          SizedBox(
                            width: isWide ? (constraints.maxWidth - 48) / 4 : (constraints.maxWidth > 600 ? (constraints.maxWidth - 16) / 2 : double.infinity),
                            child: _buildMetricCard("Loss Prevented", stats["lossPrevented"]?.toString() ?? "₹45,230", "+16.2% vs last week", Icons.shield_outlined, Colors.amber.shade800),
                          ),
                          SizedBox(
                            width: isWide ? (constraints.maxWidth - 48) / 4 : (constraints.maxWidth > 600 ? (constraints.maxWidth - 16) / 2 : double.infinity),
                            child: _buildMetricCard("Avg. Verification Time", stats["avgVerificationTime"]?.toString() ?? "2m 34s", "-8.3% vs last week", Icons.timer_outlined, Colors.blueGrey),
                          ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 24),

                  // Recent Activity Table
                  _buildRecentActivityTable(dashboardState.recentActivity),
                ],
              ),
            ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Welcome back, Admin! 👋", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            SizedBox(height: 4),
            Text("Here's what's happening in your warehouse today.", style: TextStyle(color: Colors.grey, fontSize: 13)),
          ],
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Row(
            children: [
              const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
              const SizedBox(width: 8),
              const Text("16 May 2026", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(width: 8),
              Icon(Icons.arrow_drop_down, color: Colors.grey.shade600),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, String growth, IconData icon, Color color, bool isPositive) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.w500)),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                  child: Icon(icon, color: color, size: 20),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(value, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(isPositive ? Icons.trending_up : Icons.trending_down, size: 16, color: isPositive ? Colors.green : Colors.red),
                const SizedBox(width: 4),
                Text(growth, style: TextStyle(color: isPositive ? Colors.green : Colors.red, fontSize: 12, fontWeight: FontWeight.bold)),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildVerificationOverviewCard() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Verification Overview", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300), borderRadius: BorderRadius.circular(6)),
                  child: const Row(
                    children: [
                      Text("Last 7 Days", style: TextStyle(fontSize: 12)),
                      SizedBox(width: 4),
                      Icon(Icons.arrow_drop_down, size: 16),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _legendItem("Verified", Colors.blue),
                const SizedBox(width: 16),
                _legendItem("Pending", Colors.orange),
                const SizedBox(width: 16),
                _legendItem("Exceptions", Colors.red),
              ],
            ),
            const SizedBox(height: 24),
            // Mock graphical trend chart preview
            Container(
              height: 200,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Colors.blue.shade50.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text("📈 [Interactive Multi-Line Trend Chart]", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w500)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _legendItem(String label, Color color) {
    return Row(
      children: [
        Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500)),
      ],
    );
  }

  Widget _buildOrdersByStatusCard() {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Orders by Status", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300), borderRadius: BorderRadius.circular(6)),
                  child: const Row(
                    children: [
                      Text("Last 7 Days", style: TextStyle(fontSize: 12)),
                      SizedBox(width: 4),
                      Icon(Icons.arrow_drop_down, size: 16),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                // Mock Donut Chart
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.blue, width: 14),
                  ),
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text("1,248", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        Text("Total", style: TextStyle(color: Colors.grey, fontSize: 10)),
                      ],
                    ),
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _statusLegend("Verified", "1,136 (91.0%)", Colors.blue),
                    const SizedBox(height: 8),
                    _statusLegend("Pending", "112 (9.0%)", Colors.orange),
                    const SizedBox(height: 8),
                    _statusLegend("Exceptions", "23 (2.0%)", Colors.red),
                  ],
                )
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusLegend(String label, String value, Color color) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
            Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
      ],
    );
  }

  Widget _buildMetricCard(String title, String value, String subtext, IconData icon, Color color) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                  const SizedBox(height: 4),
                  Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 2),
                  Text(subtext, style: const TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivityTable(List<Map<String, dynamic>> activities) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Recent Activity", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                TextButton(onPressed: () {}, child: const Text("View All")),
              ],
            ),
            const SizedBox(height: 12),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                headingRowColor: WidgetStateProperty.all(Colors.grey.shade50),
                columns: const [
                  DataColumn(label: Text("Activity", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Order ID", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Status", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("User", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Time", style: TextStyle(fontWeight: FontWeight.bold))),
                ],
                rows: activities.map((act) {
                  final status = act["status"].toString();
                  Color statusColor = Colors.blue;
                  if (status == "Verified") statusColor = Colors.green;
                  if (status == "Pending") statusColor = Colors.orange;
                  if (status == "Exception") statusColor = Colors.red;

                  return DataRow(
                    cells: [
                      DataCell(Row(
                        children: [
                          Icon(Icons.check_circle, size: 16, color: statusColor),
                          const SizedBox(width: 8),
                          Text(act["activity"].toString(), style: const TextStyle(fontWeight: FontWeight.w500)),
                        ],
                      )),
                      DataCell(Text(act["orderId"].toString())),
                      DataCell(
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                          child: Text(status, style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      DataCell(Text(act["user"].toString())),
                      DataCell(Text(act["time"].toString(), style: const TextStyle(color: Colors.grey))),
                    ],
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
