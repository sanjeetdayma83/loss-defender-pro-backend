// import upload_service;
import 'package:flutter/material.dart';

class RecordingTimer extends StatelessWidget {
  final Duration duration;

  const RecordingTimer({super.key, required this.duration});

  String _format(Duration d) {
    final hours = d.inHours.toString().padLeft(2, '0');
    final minutes = (d.inMinutes % 60).toString().padLeft(2, '0');
    final seconds = (d.inSeconds % 60).toString().padLeft(2, '0');

    return "$hours:$minutes:$seconds";
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (duration > Duration.zero)
          const Padding(
            padding: EdgeInsets.only(right: 8),
            child: Icon(Icons.fiber_manual_record, color: Colors.red, size: 18),
          ),
        Text(
          _format(duration),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            fontFeatures: [FontFeature.tabularFigures()],
          ),
        ),
      ],
    );
  }
}



