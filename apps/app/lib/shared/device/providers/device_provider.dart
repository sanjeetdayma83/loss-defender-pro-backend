import 'package:flutter_riverpod/flutter_riverpod.dart';

class DeviceState {
  final bool isConnected;
  final String deviceName;
  final String? selectedCamera;
  
  DeviceState({
    this.isConnected = false, 
    this.deviceName = '',
    this.selectedCamera,
  });
  
  DeviceState copyWith({
    bool? isConnected, 
    String? deviceName,
    String? selectedCamera,
  }) {
    return DeviceState(
      isConnected: isConnected ?? this.isConnected,
      deviceName: deviceName ?? this.deviceName,
      selectedCamera: selectedCamera ?? this.selectedCamera,
    );
  }
}

class DeviceNotifier extends Notifier<DeviceState> {
  @override
  DeviceState build() => DeviceState();

  void setConnection(bool status, {String name = '', String? selectedCamera}) {
    state = state.copyWith(isConnected: status, deviceName: name, selectedCamera: selectedCamera);
  }

  void disconnect() {
    state = DeviceState(isConnected: false, deviceName: '', selectedCamera: null);
  }
}

final deviceProvider = NotifierProvider<DeviceNotifier, DeviceState>(DeviceNotifier.new);
