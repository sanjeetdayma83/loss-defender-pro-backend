import 'package:flutter/material.dart';

class UploadProgressCard extends StatelessWidget {
  final bool uploading;
  final double progress;

  const UploadProgressCard({
    super.key,
    required this.uploading,
    required this.progress,
  });

  @override
  Widget build(BuildContext context) {
    if (!uploading) {
      return const SizedBox.shrink();
    }

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              "Uploading Evidence",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 20),

            LinearProgressIndicator(value: progress, minHeight: 8),

            const SizedBox(height: 16),

            Text(
              "${(progress * 100).toStringAsFixed(0)} %",
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 10),

            const Text("Please wait while the recording is uploaded."),
          ],
        ),
      ),
    );
  }
}
