import 'dart:async';

import 'package:camera/camera.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/recording_model.dart';
import '../../data/repositories/recording_repository.dart';

final recordingRepositoryProvider = Provider<RecordingRepository>(
  (ref) => RecordingRepository(),
);

class RecordingState {
  final bool loading;
  final bool recording;
  final bool uploading;
  final bool completed;

  final CameraController? controller;
  final RecordingModel? recordingModel;

  final Duration duration;

  final double uploadProgress;

  final String error;

  const RecordingState({
    this.loading = true,
    this.recording = false,
    this.uploading = false,
    this.completed = false,
    this.controller,
    this.recordingModel,
    this.duration = Duration.zero,
    this.uploadProgress = 0,
    this.error = "",
  });

  RecordingState copyWith({
    bool? loading,
    bool? recording,
    bool? uploading,
    bool? completed,
    CameraController? controller,
    RecordingModel? recordingModel,
    Duration? duration,
    double? uploadProgress,
    String? error,
  }) {
    return RecordingState(
      loading: loading ?? this.loading,
      recording: recording ?? this.recording,
      uploading: uploading ?? this.uploading,
      completed: completed ?? this.completed,
      controller: controller ?? this.controller,
      recordingModel: recordingModel ?? this.recordingModel,
      duration: duration ?? this.duration,
      uploadProgress: uploadProgress ?? this.uploadProgress,
      error: error ?? this.error,
    );
  }
}

class RecordingNotifier extends StateNotifier<RecordingState> {
  RecordingNotifier(this._repository) : super(const RecordingState());

  final RecordingRepository _repository;

  Timer? _timer;

  DateTime? _startedAt;

  List<CameraDescription> _cameras = [];

  int _cameraIndex = 0;

  Future<void> initializeCamera() async {
    try {
      _cameras = await availableCameras();

      if (_cameras.isEmpty) {
        throw Exception("No camera found");
      }

      final controller = CameraController(
        _cameras.first,
        ResolutionPreset.high,
        enableAudio: true,
      );

      await controller.initialize();

      state = state.copyWith(controller: controller, loading: false, error: "");
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> switchCamera() async {
    if (_cameras.length < 2) return;

    await state.controller?.dispose();

    _cameraIndex = (_cameraIndex + 1) % _cameras.length;

    final controller = CameraController(
      _cameras[_cameraIndex],
      ResolutionPreset.high,
      enableAudio: true,
    );

    await controller.initialize();

    state = state.copyWith(controller: controller);
  }

  Future<void> startRecording(String orderId) async {
    if (state.loading) return;

    if (state.recording) return;

    try {
      final recording = await _repository.startRecording(orderId);

      await state.controller!.startVideoRecording();

      _startedAt = DateTime.now();

      _timer?.cancel();

      _timer = Timer.periodic(const Duration(seconds: 1), (_) {
        state = state.copyWith(
          duration: DateTime.now().difference(_startedAt!),
        );
      });

      state = state.copyWith(
        loading: false,
        recording: true,
        uploading: false,
        completed: false,
        uploadProgress: 0,
        error: "",
        recordingModel: recording,
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> stopRecording() async {
    try {
      if (!state.recording) return;

      if (state.recordingModel == null) return;

      state = state.copyWith(uploading: true, uploadProgress: 0.25);

      final file = await state.controller!.stopVideoRecording();

      _timer?.cancel();

      await _repository.stopRecording(state.recordingModel!.id);

      state = state.copyWith(uploadProgress: 0.55);

      final uploaded = await _repository.uploadRecording(
        recordingId: state.recordingModel!.id,
        filePath: file.path,
      );

      state = state.copyWith(
        recording: false,
        uploading: false,
        completed: true,
        duration: Duration.zero,
        uploadProgress: 1.0,
        recordingModel: uploaded,
      );
    } catch (e) {
      state = state.copyWith(
        recording: false,
        uploading: false,
        completed: false,
        error: e.toString(),
      );
    }
  }

  Future<void> toggleFlash() async {
    final controller = state.controller;

    if (controller == null) return;

    if (controller.value.flashMode == FlashMode.off) {
      await controller.setFlashMode(FlashMode.torch);
    } else {
      await controller.setFlashMode(FlashMode.off);
    }
  }

  void resetRecording() {
    state = state.copyWith(
      recording: false,
      uploading: false,
      completed: false,
      uploadProgress: 0,
      duration: Duration.zero,
      error: "",
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    state.controller?.dispose();
    super.dispose();
  }
}

final recordingProvider =
    StateNotifierProvider<RecordingNotifier, RecordingState>(
      (ref) => RecordingNotifier(ref.read(recordingRepositoryProvider)),
    );
