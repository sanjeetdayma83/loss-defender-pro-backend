import 'package:camera/camera.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/device_service.dart';

final deviceServiceProvider = Provider<DeviceService>((ref) {
  return DeviceService();
});

class DeviceState {
  final bool loading;
  final List<CameraDescription> cameras;
  final CameraDescription? selectedCamera;
  final String error;

  const DeviceState({
    this.loading = false,
    this.cameras = const [],
    this.selectedCamera,
    this.error = '',
  });

  DeviceState copyWith({
    bool? loading,
    List<CameraDescription>? cameras,
    CameraDescription? selectedCamera,
    String? error,
  }) {
    return DeviceState(
      loading: loading ?? this.loading,
      cameras: cameras ?? this.cameras,
      selectedCamera: selectedCamera ?? this.selectedCamera,
      error: error ?? this.error,
    );
  }
}

class DeviceNotifier extends StateNotifier<DeviceState> {
  DeviceNotifier(this._service) : super(const DeviceState());

  final DeviceService _service;

  Future<void> loadDevices() async {
    try {
      state = state.copyWith(loading: true, error: '');

      final cameras = await _service.getAvailableCameras();

      state = state.copyWith(
        loading: false,
        cameras: cameras,
        selectedCamera: _service.selectedCamera,
      );
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> refresh() async {
    await loadDevices();
  }

  Future<void> selectCamera(CameraDescription camera) async {
    await _service.selectCamera(camera);

    state = state.copyWith(selectedCamera: camera);
  }
}

final deviceProvider = StateNotifierProvider<DeviceNotifier, DeviceState>((
  ref,
) {
  return DeviceNotifier(ref.read(deviceServiceProvider));
});
