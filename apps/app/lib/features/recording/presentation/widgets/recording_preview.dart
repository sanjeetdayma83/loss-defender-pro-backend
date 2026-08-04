// import upload_service;
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

class RecordingPreview extends StatefulWidget {
  final String filePath;

  final VoidCallback? onUpload;

  final VoidCallback? onDiscard;

  const RecordingPreview({
    super.key,
    required this.filePath,
    this.onUpload,
    this.onDiscard,
  });

  @override
  State<RecordingPreview> createState() => _RecordingPreviewState();
}

class _RecordingPreviewState extends State<RecordingPreview> {
  late VideoPlayerController controller;

  bool loading = true;

  @override
  void initState() {
    super.initState();

    controller = VideoPlayerController.file(File(widget.filePath));

    controller.initialize().then((_) {
      setState(() {
        loading = false;
      });

      controller.play();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      appBar: AppBar(title: const Text("Recording Preview")),
      body: Column(
        children: [
          Expanded(
            child: Center(
              child: AspectRatio(
                aspectRatio: controller.value.aspectRatio,
                child: VideoPlayer(controller),
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: widget.onDiscard,
                    icon: const Icon(Icons.delete),
                    label: const Text("Discard"),
                  ),
                ),

                const SizedBox(width: 20),

                Expanded(
                  child: FilledButton.icon(
                    onPressed: widget.onUpload,
                    icon: const Icon(Icons.cloud_upload),
                    label: const Text("Upload"),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          if (controller.value.isPlaying) {
            controller.pause();
          } else {
            controller.play();
          }

          setState(() {});
        },
        child: Icon(
          controller.value.isPlaying ? Icons.pause : Icons.play_arrow,
        ),
      ),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}



