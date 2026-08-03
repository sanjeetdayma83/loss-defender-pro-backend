import 'package:flutter/material.dart';

class ScanStatusCard extends StatelessWidget {
  final String sku;
  final String status;

  const ScanStatusCard({super.key, required this.sku, required this.status});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.qr_code),
        title: Text(sku.isEmpty ? "Waiting for scan..." : sku),
        subtitle: Text(status),
      ),
    );
  }
}
