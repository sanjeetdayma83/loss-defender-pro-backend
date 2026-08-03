import 'package:flutter/material.dart';

import '../../data/models/order_model.dart';

class OrderProgressCard extends StatelessWidget {
  final OrderModel order;

  const OrderProgressCard({super.key, required this.order});

  Color _color(String value) {
    switch (value.toUpperCase()) {
      case "COMPLETED":
      case "DONE":
      case "VERIFIED":
        return Colors.green;

      case "IN_PROGRESS":
      case "PACKING":
        return Colors.orange;

      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Progress",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),

            const SizedBox(height: 20),

            _progress("Packing", order.packingStatus),

            const SizedBox(height: 16),

            _progress("Verification", order.verificationStatus),

            const SizedBox(height: 16),

            LinearProgressIndicator(
              value: order.expectedItemCount == 0
                  ? 0
                  : order.verifiedItemCount / order.expectedItemCount,
            ),

            const SizedBox(height: 10),

            Text(
              "${order.verifiedItemCount}/${order.expectedItemCount} Items Verified",
            ),
          ],
        ),
      ),
    );
  }

  Widget _progress(String title, String value) {
    return Row(
      children: [
        Expanded(child: Text(title)),
        Chip(
          label: Text(value),
          backgroundColor: _color(value).withValues(alpha: .15),
        ),
      ],
    );
  }
}
