import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/dashboard_provider.dart';

class DashboardRecentOrdersTable extends ConsumerWidget {
  const DashboardRecentOrdersTable({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recent = ref.watch(recentOrdersProvider);

    return recent.when(
      loading: () => const Center(child: CircularProgressIndicator()),

      error: (error, stack) => Center(child: Text(error.toString())),

      data: (orders) {
        return Card(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columns: const [
                DataColumn(label: Text("Order")),
                DataColumn(label: Text("Customer")),
                DataColumn(label: Text("Marketplace")),
                DataColumn(label: Text("Priority")),
                DataColumn(label: Text("Status")),
              ],
              rows: orders.map((order) {
                return DataRow(
                  cells: [
                    DataCell(Text(order.orderNumber)),
                    DataCell(Text(order.customerName)),
                    DataCell(Text(order.marketplace)),
                    DataCell(Text(order.priority)),
                    DataCell(Text(order.status)),
                  ],
                );
              }).toList(),
            ),
          ),
        );
      },
    );
  }
}
