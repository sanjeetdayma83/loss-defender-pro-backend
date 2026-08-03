import 'package:flutter/material.dart';

class OrderSummaryCard extends StatelessWidget {
  final String orderId;
  final int expected;
  final int verified;

  const OrderSummaryCard({
    super.key,
    required this.orderId,
    required this.expected,
    required this.verified,
  });

  @override
  Widget build(BuildContext context) {
    final remaining = expected - verified;

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Current Order",
              style: Theme.of(context).textTheme.titleLarge,
            ),

            const SizedBox(height: 20),

            _row("Order ID", orderId),
            _row("Expected Items", expected.toString()),
            _row("Verified", verified.toString()),
            _row("Remaining", remaining.toString()),

            const SizedBox(height: 20),

            LinearProgressIndicator(
              value: expected == 0 ? 0 : verified / expected,
            ),
          ],
        ),
      ),
    );
  }

  Widget _row(String title, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          Text(value),
        ],
      ),
    );
  }
}
