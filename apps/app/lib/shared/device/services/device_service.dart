import 'package:camera/camera.dart';

class DeviceService {
  DeviceService();

  List<CameraDescription> _cameras = [];

  CameraDescription? _selectedCamera;

  Future<List<CameraDescription>> getAvailableCameras() async {
    _cameras = await availableCameras();

    if (_cameras.isNotEmpty && _selectedCamera == null) {
      _selectedCamera = _cameras.first;
    }

    return _cameras;
  }

  Future<List<CameraDescription>> refreshDevices() async {
    return getAvailableCameras();
  }

  CameraDescription? get selectedCamera => _selectedCamera;

  List<CameraDescription> get cameras => List.unmodifiable(_cameras);

  Future<void> selectCamera(CameraDescription camera) async {
    _selectedCamera = camera;
  }

  String getCameraName(CameraDescription camera) {
    if (camera.name.trim().isNotEmpty) {
      return camera.name;
    }

    switch (camera.lensDirection) {
      case CameraLensDirection.front:
        return "Front Camera";

      case CameraLensDirection.back:
        return "Back Camera";

      case CameraLensDirection.external:
        return "External Camera";
    }
  }

  String getCameraType(CameraDescription camera) {
    switch (camera.lensDirection) {
      case CameraLensDirection.front:
        return "Front";

      case CameraLensDirection.back:
        return "Back";

      case CameraLensDirection.external:
        return "USB / External";
    }
  }

  bool isSelected(CameraDescription camera) {
    return _selectedCamera?.name == camera.name;
  }

  int get cameraCount => _cameras.length;
}
