import 'package:flutter/material.dart';

class ScannedItemsList extends StatelessWidget {
  final List<String> items;

  const ScannedItemsList({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: SizedBox(
        height: 220,
        child: ListView.builder(
          itemCount: items.length,
          itemBuilder: (_, index) {
            return ListTile(
              leading: const Icon(Icons.qr_code, color: Colors.green),
              title: Text(items[index]),
            );
          },
        ),
      ),
    );
  }
}
