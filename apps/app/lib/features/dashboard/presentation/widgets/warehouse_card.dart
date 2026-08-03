import 'package:flutter/material.dart';

class WarehouseCard extends StatelessWidget {
  final String warehouse;
  final int utilization;

  const WarehouseCard({
    super.key,
    required this.warehouse,
    required this.utilization,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              warehouse,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 18),
            LinearProgressIndicator(
              value: utilization / 100,
              borderRadius: BorderRadius.circular(10),
              minHeight: 10,
            ),
            const SizedBox(height: 12),
            Text(
              "$utilization% Utilized",
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}
