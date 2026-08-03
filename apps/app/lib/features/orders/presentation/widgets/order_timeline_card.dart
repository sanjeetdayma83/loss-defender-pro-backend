import 'package:flutter/material.dart';

import '../../data/models/order_model.dart';

class OrderTimelineCard extends StatelessWidget {
  final OrderModel order;

  const OrderTimelineCard({super.key, required this.order});

  Widget tile(IconData icon, String title, String subtitle, Color color) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color.withValues(alpha: .15),
        child: Icon(icon, color: color),
      ),
      title: Text(title),
      subtitle: Text(subtitle),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      child: Column(
        children: [
          tile(
            Icons.receipt_long,
            "Order Created",
            order.createdAt.toString(),
            Colors.blue,
          ),

          tile(Icons.inventory, "Packing", order.packingStatus, Colors.orange),

          tile(
            Icons.verified,
            "Verification",
            order.verificationStatus,
            Colors.green,
          ),

          tile(Icons.local_shipping, "Shipment", order.status, Colors.purple),
        ],
      ),
    );
  }
}
