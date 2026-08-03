import 'package:flutter/material.dart';

class DashboardHeader extends StatelessWidget {
  const DashboardHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Warehouse Dashboard",
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              "Monitor warehouse operations in real time",
              style: TextStyle(color: Colors.grey.shade600, fontSize: 15),
            ),
          ],
        ),

        const Spacer(),

        SizedBox(
          width: 320,
          child: TextField(
            decoration: InputDecoration(
              hintText: "Search Orders...",
              prefixIcon: const Icon(Icons.search),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ),

        const SizedBox(width: 20),

        CircleAvatar(
          radius: 24,
          backgroundColor: Colors.blue,
          child: const Icon(Icons.person, color: Colors.white),
        ),
      ],
    );
  }
}
