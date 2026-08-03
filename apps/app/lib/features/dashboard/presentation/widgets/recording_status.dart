import 'package:flutter/material.dart';

class RecordingStatus extends StatelessWidget {
  final int active;
  final int uploaded;

  const RecordingStatus({
    super.key,
    required this.active,
    required this.uploaded,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Recording Sessions",
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),

          const SizedBox(height: 20),

          ListTile(
            leading: const Icon(Icons.videocam),
            title: const Text("Active"),
            trailing: Text(active.toString()),
          ),

          ListTile(
            leading: const Icon(Icons.cloud_upload),
            title: const Text("Uploaded"),
            trailing: Text(uploaded.toString()),
          ),
        ],
      ),
    );
  }
}
