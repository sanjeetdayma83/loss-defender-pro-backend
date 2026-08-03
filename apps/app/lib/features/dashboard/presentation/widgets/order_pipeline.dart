import 'package:flutter/material.dart';

class OrderPipeline extends StatelessWidget {
  final int packing;
  final int verification;
  final int ready;

  const OrderPipeline({
    super.key,
    required this.packing,
    required this.verification,
    required this.ready,
  });

  Widget _buildStage(String title, int value, Color color, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: color.withValues(alpha: .08),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 34),
            const SizedBox(height: 14),
            Text(
              value.toString(),
              style: const TextStyle(fontSize: 30, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(title),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: .05),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Order Pipeline",
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),

          const SizedBox(height: 25),

          Row(
            children: [
              _buildStage("Packing", packing, Colors.orange, Icons.inventory),

              const SizedBox(width: 20),

              _buildStage(
                "Verification",
                verification,
                Colors.blue,
                Icons.fact_check,
              ),

              const SizedBox(width: 20),

              _buildStage("Ready", ready, Colors.green, Icons.local_shipping),
            ],
          ),
        ],
      ),
    );
  }
}
