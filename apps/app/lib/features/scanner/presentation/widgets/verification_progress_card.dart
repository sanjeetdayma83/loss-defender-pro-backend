import 'package:flutter/material.dart';

class VerificationProgressCard extends StatelessWidget {
  final double progress;

  const VerificationProgressCard({super.key, required this.progress});

  @override
  Widget build(BuildContext context) {
    final percent = (progress * 100).round();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              children: [
                const Text(
                  "Verification Progress",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                Text("$percent%"),
              ],
            ),

            const SizedBox(height: 18),

            LinearProgressIndicator(
              value: progress,
              minHeight: 10,
              borderRadius: BorderRadius.circular(20),
            ),
          ],
        ),
      ),
    );
  }
}
