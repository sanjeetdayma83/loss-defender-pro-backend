import 'package:flutter/material.dart';

import '../../data/models/order_model.dart';

class OrderItemsCard extends StatelessWidget {
  final OrderModel order;

  const OrderItemsCard({super.key, required this.order});

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
              "Verification",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 20),

            Row(
              children: [
                Expanded(
                  child: _item("Expected", order.expectedItemCount.toString()),
                ),

                Expanded(
                  child: _item("Verified", order.verifiedItemCount.toString()),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _item(String title, String value) {
    return Column(
      children: [
        Text(
          value,
          style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 6),
        Text(title),
      ],
    );
  }
}
