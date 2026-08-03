import 'package:flutter/material.dart';

class PaginationFooter extends StatelessWidget {
  final int page;
  final int total;
  final int limit;
  final bool hasNext;
  final bool hasPrevious;
  final VoidCallback? next;
  final VoidCallback? previous;

  const PaginationFooter({
    super.key,
    required this.page,
    required this.total,
    required this.limit,
    required this.hasNext,
    required this.hasPrevious,
    this.next,
    this.previous,
  });

  @override
  Widget build(BuildContext context) {
    final start = total == 0 ? 0 : ((page - 1) * limit) + 1;
    final end = (page * limit > total) ? total : page * limit;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: [
          Text(
            "Showing $start-$end of $total orders",
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),

          const Spacer(),

          OutlinedButton(
            onPressed: hasPrevious ? previous : null,
            child: const Text("Previous"),
          ),

          const SizedBox(width: 12),

          FilledButton(
            onPressed: hasNext ? next : null,
            child: const Text("Next"),
          ),
        ],
      ),
    );
  }
}
