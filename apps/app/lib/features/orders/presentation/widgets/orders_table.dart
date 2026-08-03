import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/order_model.dart';
import '../providers/orders_provider.dart';
import 'order_actions.dart';
import 'order_details_drawer.dart';
import 'priority_chip.dart';
import 'status_chip.dart';

class OrdersTable extends ConsumerWidget {
  final String search;

  const OrdersTable({super.key, required this.search});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);

    return orders.when(
      loading: () => const Center(child: CircularProgressIndicator()),

      error: (error, stackTrace) => Center(child: Text(error.toString())),

      data: (response) {
        final filtered = response.items;

        if (filtered.isEmpty) {
          return const Center(
            child: Text("No orders found", style: TextStyle(fontSize: 16)),
          );
        }

        return SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              showCheckboxColumn: false,
              headingRowHeight: 52,
              dataRowMinHeight: 64,
              dataRowMaxHeight: 64,
              columnSpacing: 28,

              columns: const [
                DataColumn(label: Text("Priority")),
                DataColumn(label: Text("Order")),
                DataColumn(label: Text("Customer")),
                DataColumn(label: Text("Marketplace")),
                DataColumn(label: Text("Status")),
                DataColumn(label: Text("Packing")),
                DataColumn(label: Text("Verification")),
                DataColumn(label: Text("Actions")),
              ],

              rows: filtered.map((OrderModel order) {
                return DataRow(
                  onSelectChanged: (_) {
                    showModalBottomSheet(
                      context: context,
                      isScrollControlled: true,
                      useSafeArea: true,
                      builder: (_) {
                        return SizedBox(
                          height: MediaQuery.of(context).size.height * .92,
                          child: OrderDetailsDrawer(order: order),
                        );
                      },
                    );
                  },

                  cells: [
                    DataCell(PriorityChip(priority: order.priority)),

                    DataCell(Text(order.orderNumber)),

                    DataCell(Text(order.customerName)),

                    DataCell(Text(order.marketplace)),

                    DataCell(StatusChip(status: order.status)),

                    DataCell(StatusChip(status: order.packingStatus)),

                    DataCell(StatusChip(status: order.verificationStatus)),

                    DataCell(OrderActions(orderId: order.id)),
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
