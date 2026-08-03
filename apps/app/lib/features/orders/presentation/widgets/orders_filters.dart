import 'package:flutter/material.dart';

class OrdersFilters extends StatelessWidget {
  final ValueChanged<String?> onMarketplace;
  final ValueChanged<String?> onStatus;
  final ValueChanged<String?> onPriority;

  const OrdersFilters({
    super.key,
    required this.onMarketplace,
    required this.onStatus,
    required this.onPriority,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 180,
          child: DropdownButtonFormField<String>(
            decoration: const InputDecoration(labelText: "Marketplace"),
            items: const [
              DropdownMenuItem(value: "", child: Text("All")),
              DropdownMenuItem(value: "AMAZON", child: Text("Amazon")),
              DropdownMenuItem(value: "FLIPKART", child: Text("Flipkart")),
              DropdownMenuItem(value: "MEESHO", child: Text("Meesho")),
            ],
            onChanged: onMarketplace,
          ),
        ),

        const SizedBox(width: 16),

        SizedBox(
          width: 180,
          child: DropdownButtonFormField<String>(
            decoration: const InputDecoration(labelText: "Status"),
            items: const [
              DropdownMenuItem(value: "", child: Text("All")),
              DropdownMenuItem(value: "CREATED", child: Text("Created")),
              DropdownMenuItem(value: "PACKING", child: Text("Packing")),
              DropdownMenuItem(value: "VERIFYING", child: Text("Verifying")),
              DropdownMenuItem(value: "READY_TO_SHIP", child: Text("Ready")),
              DropdownMenuItem(value: "SHIPPED", child: Text("Shipped")),
            ],
            onChanged: onStatus,
          ),
        ),

        const SizedBox(width: 16),

        SizedBox(
          width: 180,
          child: DropdownButtonFormField<String>(
            decoration: const InputDecoration(labelText: "Priority"),
            items: const [
              DropdownMenuItem(value: "", child: Text("All")),
              DropdownMenuItem(value: "LOW", child: Text("Low")),
              DropdownMenuItem(value: "MEDIUM", child: Text("Medium")),
              DropdownMenuItem(value: "HIGH", child: Text("High")),
            ],
            onChanged: onPriority,
          ),
        ),
      ],
    );
  }
}
