import 'package:flutter/material.dart';

import '../../data/models/order_model.dart';
import 'customer_info_card.dart';
import 'order_progress_card.dart';
import 'order_timeline_card.dart';
import 'shipping_address_card.dart';
import 'order_items_card.dart';
import 'workflow_card.dart';
import 'status_chip.dart';

class OrderDetailsDrawer extends StatelessWidget {
  final OrderModel order;

  const OrderDetailsDrawer({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      width: 520,
      child: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          order.orderNumber,
                          style: const TextStyle(
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                          ),
                        ),

                        const SizedBox(height: 8),

                        Text(
                          order.marketplaceOrderId,
                          style: const TextStyle(color: Colors.grey),
                        ),
                      ],
                    ),
                  ),

                  StatusChip(status: order.status),
                ],
              ),
            ),

            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  CustomerInfoCard(order: order),

                  const SizedBox(height: 16),

                  ShippingAddressCard(order: order),

                  const SizedBox(height: 16),

                  OrderItemsCard(order: order),

                  const SizedBox(height: 16),

                  OrderProgressCard(order: order),

                  const SizedBox(height: 16),

                  WorkflowCard(orderId: order.id),

                  const SizedBox(height: 16),

                  OrderTimelineCard(order: order),

                  const SizedBox(height: 30),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
