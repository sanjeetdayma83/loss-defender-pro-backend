import 'package:flutter/material.dart';

import '../../data/models/order_model.dart';

class ShippingAddressCard extends StatelessWidget {
  final OrderModel order;

  const ShippingAddressCard({super.key, required this.order});

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
              "Shipping",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 16),

            Text("Warehouse ID"),
            Text(
              order.warehouseId,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),

            const SizedBox(height: 12),

            Text("Customer Phone"),
            Text(
              order.customerPhone,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}
