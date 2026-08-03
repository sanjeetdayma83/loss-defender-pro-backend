import 'package:flutter/material.dart';

class RecordingControls extends StatelessWidget {
  final bool recording;
  final VoidCallback? onStart;
  final VoidCallback? onStop;

  const RecordingControls({
    super.key,
    required this.recording,
    this.onStart,
    this.onStop,
  });

  @override
  Widget build(BuildContext context) {
    final color = recording ? Colors.red : Colors.green;

    return SizedBox(
      width: double.infinity,
      height: 60,
      child: FilledButton.icon(
        onPressed: recording ? onStop : onStart,
        style: FilledButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 56),
        ),
        icon: Icon(
          recording
              ? Icons.stop_circle_rounded
              : Icons.fiber_manual_record_rounded,
        ),
        label: Text(recording ? "STOP RECORDING" : "START RECORDING"),
      ),
    );
  }
}
