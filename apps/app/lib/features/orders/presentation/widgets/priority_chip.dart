import 'package:flutter/material.dart';

class PriorityChip extends StatelessWidget {
  final String priority;

  const PriorityChip({super.key, required this.priority});

  Color get color {
    switch (priority) {
      case "HIGH":
        return Colors.red;

      case "MEDIUM":
        return Colors.orange;

      case "LOW":
        return Colors.green;

      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(priority),
      backgroundColor: color.withValues(alpha: .15),
    );
  }
}
