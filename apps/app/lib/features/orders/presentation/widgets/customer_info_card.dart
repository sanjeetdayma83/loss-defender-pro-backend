import 'package:flutter/material.dart';

import '../../data/models/order_model.dart';

class CustomerInfoCard extends StatelessWidget {
  final OrderModel order;

  const CustomerInfoCard({super.key, required this.order});

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
              "Customer Information",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 20),

            _row(Icons.person, "Customer", order.customerName),
            _row(Icons.phone, "Phone", order.customerPhone),
            _row(Icons.store, "Marketplace", order.marketplace),
            _row(
              Icons.confirmation_number,
              "Marketplace Order",
              order.marketplaceOrderId,
            ),
          ],
        ),
      ),
    );
  }

  Widget _row(IconData icon, String title, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          Expanded(flex: 2, child: Text(value)),
        ],
      ),
    );
  }
}
