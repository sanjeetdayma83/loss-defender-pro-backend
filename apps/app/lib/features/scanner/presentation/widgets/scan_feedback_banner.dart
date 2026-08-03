import 'package:flutter/material.dart';

import '../../data/models/scan_feedback.dart';

class ScanFeedbackBanner extends StatelessWidget {
  final ScanFeedback? feedback;

  const ScanFeedbackBanner({super.key, required this.feedback});

  @override
  Widget build(BuildContext context) {
    if (feedback == null) {
      return const SizedBox.shrink();
    }

    Color color;
    IconData icon;

    switch (feedback!.type) {
      case ScanFeedbackType.success:
        color = Colors.green;
        icon = Icons.check_circle;
        break;

      case ScanFeedbackType.duplicate:
        color = Colors.orange;
        icon = Icons.warning_amber_rounded;
        break;

      case ScanFeedbackType.wrongSku:
        color = Colors.red;
        icon = Icons.cancel;
        break;

      case ScanFeedbackType.error:
        color = Colors.red.shade700;
        icon = Icons.error;
        break;
    }

    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white, size: 34),

          const SizedBox(width: 16),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  feedback!.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),

                const SizedBox(height: 4),

                Text(
                  feedback!.message,
                  style: const TextStyle(color: Colors.white),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
