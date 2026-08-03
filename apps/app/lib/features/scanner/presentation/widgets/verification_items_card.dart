import 'package:flutter/material.dart';

import '../../data/models/scanned_item.dart';

class VerificationItemsCard extends StatelessWidget {
  final List<ScannedItem> items;

  const VerificationItemsCard({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            color: Theme.of(context).colorScheme.primaryContainer,
            child: const Text(
              "Verification Items",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
          ),

          Expanded(
            child: ListView.separated(
              itemCount: items.length,
              separatorBuilder: (_, _) => const Divider(height: 1),
              itemBuilder: (_, index) {
                final item = items[index];

                final completed = item.scannedQty >= item.expectedQty;

                final remaining = item.expectedQty - item.scannedQty;

                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: completed ? Colors.green : Colors.orange,
                    child: Icon(
                      completed ? Icons.check : Icons.inventory_2,
                      color: Colors.white,
                    ),
                  ),

                  title: Text(
                    item.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),

                  subtitle: Text(item.sku),

                  trailing: SizedBox(
                    width: 90,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          "${item.scannedQty}/${item.expectedQty}",
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),

                        Text(
                          completed ? "Done" : "$remaining Left",
                          style: TextStyle(
                            fontSize: 11,
                            color: completed ? Colors.green : Colors.orange,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
