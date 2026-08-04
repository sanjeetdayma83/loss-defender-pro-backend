import 'package:flutter_riverpod/flutter_riverpod.dart';

class RecordingState {
  final bool isRecording;
  final String? videoPath;
  final String? recordingModel;

  RecordingState({this.isRecording = false, this.videoPath, this.recordingModel});
  
  RecordingState copyWith({bool? isRecording, String? videoPath, String? recordingModel}) {
    return RecordingState(
      isRecording: isRecording ?? this.isRecording,
      videoPath: videoPath ?? this.videoPath,
      recordingModel: recordingModel ?? this.recordingModel,
    );
  }
}

class RecordingNotifier extends Notifier<RecordingState> {
  @override
  RecordingState build() => RecordingState();

  void startRecording() => state = state.copyWith(isRecording: true);
  
  Future<void> stopRecording(String path) async {
    state = state.copyWith(isRecording: false, videoPath: path, recordingModel: path);
  }
}

final recordingProvider = NotifierProvider<RecordingNotifier, RecordingState>(RecordingNotifier.new);
