import 'package:flutter/material.dart';

import '../../data/repositories/orders_repository.dart';

class WorkflowCard extends StatelessWidget {
  final String orderId;

  const WorkflowCard({super.key, required this.orderId});

  Future<void> _run(
    BuildContext context,
    Future<void> Function() action,
    String message,
  ) async {
    try {
      await action();

      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(message)));
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final repo = OrdersRepository();

    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Workflow",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),

            const SizedBox(height: 20),

            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                FilledButton.icon(
                  onPressed: () => _run(
                    context,
                    () => repo.startPacking(orderId),
                    "Packing Started",
                  ),
                  icon: const Icon(Icons.inventory_2),
                  label: const Text("Packing"),
                ),

                FilledButton.icon(
                  onPressed: () => _run(
                    context,
                    () => repo.startRecording(orderId),
                    "Recording Started",
                  ),
                  icon: const Icon(Icons.videocam),
                  label: const Text("Recording"),
                ),

                FilledButton.icon(
                  onPressed: () => _run(
                    context,
                    () => repo.startVerification(orderId),
                    "Verification Started",
                  ),
                  icon: const Icon(Icons.verified),
                  label: const Text("Verify"),
                ),

                FilledButton.icon(
                  onPressed: () => _run(
                    context,
                    () => repo.readyToShip(orderId),
                    "Ready To Ship",
                  ),
                  icon: const Icon(Icons.local_shipping),
                  label: const Text("Ready"),
                ),

                FilledButton.icon(
                  style: FilledButton.styleFrom(backgroundColor: Colors.green),
                  onPressed: () =>
                      _run(context, () => repo.ship(orderId), "Order Shipped"),
                  icon: const Icon(Icons.check_circle),
                  label: const Text("Ship"),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
