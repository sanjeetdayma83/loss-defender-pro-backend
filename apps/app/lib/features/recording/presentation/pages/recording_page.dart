import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/recording_provider.dart';
import '../widgets/recording_controls.dart';
import '../widgets/recording_timer.dart';
import '../widgets/upload_progress_card.dart';

class RecordingPage extends ConsumerStatefulWidget {
  final String orderId;

  const RecordingPage({super.key, required this.orderId});

  @override
  ConsumerState<RecordingPage> createState() => _RecordingPageState();
}

class _RecordingPageState extends ConsumerState<RecordingPage> {
  @override
  void initState() {
    super.initState();

    Future.microtask(() {
      ref.read(recordingProvider.notifier).initializeCamera();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(recordingProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Packing Recording"),
        actions: [
          IconButton(
            onPressed: state.uploading
                ? null
                : () {
                    ref.read(recordingProvider.notifier).toggleFlash();
                  },
            icon: const Icon(Icons.flash_on),
          ),
          IconButton(
            onPressed: state.uploading
                ? null
                : () {
                    ref.read(recordingProvider.notifier).switchCamera();
                  },
            icon: const Icon(Icons.cameraswitch),
          ),
        ],
      ),
      body: Builder(
        builder: (_) {
          if (state.loading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state.error.isNotEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Text(state.error, textAlign: TextAlign.center),
              ),
            );
          }

          if (state.controller == null) {
            return const Center(child: Text("Camera not available"));
          }

          return Column(
            children: [
              Expanded(
                flex: 7,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    CameraPreview(state.controller!),

                    IgnorePointer(
                      child: Center(
                        child: Container(
                          width: 280,
                          height: 280,
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.green, width: 3),
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                      ),
                    ),

                    Positioned(
                      top: 20,
                      left: 20,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: RecordingTimer(duration: state.duration),
                      ),
                    ),
                  ],
                ),
              ),

              Expanded(
                flex: 3,
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Order",
                                style: Theme.of(context).textTheme.titleMedium,
                              ),

                              const SizedBox(height: 8),

                              Text(widget.orderId),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      UploadProgressCard(
                        uploading: state.uploading,
                        progress: state.uploadProgress,
                      ),

                      if (state.completed) ...[
                        const SizedBox(height: 16),

                        Card(
                          color: Colors.green.shade50,
                          child: const Padding(
                            padding: EdgeInsets.all(16),
                            child: Row(
                              children: [
                                Icon(Icons.check_circle, color: Colors.green),

                                SizedBox(width: 12),

                                Expanded(
                                  child: Text(
                                    "Evidence uploaded successfully.",
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],

                      const Spacer(),

                      RecordingControls(
                        recording: state.recording,
                        onStart: state.uploading
                            ? null
                            : () {
                                ref
                                    .read(recordingProvider.notifier)
                                    .startRecording(widget.orderId);
                              },
                        onStop: state.uploading
                            ? null
                            : () {
                                ref
                                    .read(recordingProvider.notifier)
                                    .stopRecording();
                              },
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
