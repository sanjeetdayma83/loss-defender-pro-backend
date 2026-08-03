import 'package:flutter/material.dart';

class StatusChip extends StatelessWidget {
  final String status;

  const StatusChip({super.key, required this.status});

  Color get color {
    switch (status.toUpperCase()) {
      case "CREATED":
        return Colors.blue;

      case "PACKING":
        return Colors.orange;

      case "PACKED":
        return Colors.teal;

      case "VERIFYING":
        return Colors.purple;

      case "VERIFIED":
        return Colors.green;

      case "READY_TO_SHIP":
        return Colors.indigo;

      case "SHIPPED":
        return Colors.green;

      case "DELIVERED":
        return Colors.green;

      case "CANCELLED":
        return Colors.red;

      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .12),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Text(
        status,
        style: TextStyle(color: color, fontWeight: FontWeight.bold),
      ),
    );
  }
}
