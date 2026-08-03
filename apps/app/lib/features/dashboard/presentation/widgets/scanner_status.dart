import 'package:flutter/material.dart';

class ScannerStatus extends StatelessWidget {
  final int scanned;
  final int verified;

  const ScannerStatus({
    super.key,
    required this.scanned,
    required this.verified,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Text(
              "Scanner Status",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
            ),

            const SizedBox(height: 20),

            ListTile(
              leading: const Icon(Icons.qr_code_scanner),
              title: const Text("Scanned"),
              trailing: Text(scanned.toString()),
            ),

            ListTile(
              leading: const Icon(Icons.verified),
              title: const Text("Verified"),
              trailing: Text(verified.toString()),
            ),
          ],
        ),
      ),
    );
  }
}
