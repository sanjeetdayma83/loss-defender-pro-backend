import 'package:flutter/material.dart';

import '../../data/models/evidence_model.dart';

class EvidenceInfoCard extends StatelessWidget {
  final EvidenceModel evidence;

  const EvidenceInfoCard({super.key, required this.evidence});

  String _formatBytes(int bytes) {
    if (bytes < 1024) {
      return "$bytes B";
    }

    if (bytes < 1024 * 1024) {
      return "${(bytes / 1024).toStringAsFixed(1)} KB";
    }

    return "${(bytes / (1024 * 1024)).toStringAsFixed(2)} MB";
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Evidence Details",
              style: Theme.of(context).textTheme.titleLarge,
            ),

            const SizedBox(height: 20),

            _row("Order", evidence.orderId),

            _row("Duration", "${evidence.duration} sec"),

            _row("File Size", _formatBytes(evidence.fileSize)),

            _row("Uploaded By", evidence.uploadedBy),

            _row("Uploaded", evidence.uploadedAt.toLocal().toString()),
          ],
        ),
      ),
    );
  }

  Widget _row(String title, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          SizedBox(
            width: 120,
            child: Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
