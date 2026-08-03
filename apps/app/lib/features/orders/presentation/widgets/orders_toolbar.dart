import 'package:flutter/material.dart';

class OrdersToolbar extends StatelessWidget {
  final ValueChanged<String> onSearch;
  final VoidCallback? onRefresh;
  final VoidCallback? onNewOrder;

  const OrdersToolbar({
    super.key,
    required this.onSearch,
    this.onRefresh,
    this.onNewOrder,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          flex: 3,
          child: TextField(
            onChanged: onSearch,
            decoration: InputDecoration(
              hintText: "Search by Order, Customer, Marketplace...",
              prefixIcon: const Icon(Icons.search),
              filled: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ),

        const SizedBox(width: 16),

        SizedBox(
          width: 180,
          child: DropdownButtonFormField<String>(
            decoration: const InputDecoration(labelText: "Marketplace"),
            items: const [
              DropdownMenuItem(value: "ALL", child: Text("All")),
              DropdownMenuItem(value: "AMAZON", child: Text("Amazon")),
              DropdownMenuItem(value: "FLIPKART", child: Text("Flipkart")),
              DropdownMenuItem(value: "MEESHO", child: Text("Meesho")),
            ],
            onChanged: (_) {},
          ),
        ),

        const SizedBox(width: 16),

        IconButton.filled(
          onPressed: onRefresh,
          icon: const Icon(Icons.refresh),
        ),

        const SizedBox(width: 12),

        FilledButton.icon(
          onPressed: onNewOrder,
          icon: const Icon(Icons.add),
          label: const Text("New Order"),
        ),
      ],
    );
  }
}
