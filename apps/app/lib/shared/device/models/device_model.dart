enum DeviceType {
  camera,
  scanner,
  microphone,
  printer,
  weighingScale,
  rfidReader,
  unknown,
}

enum DeviceConnectionType {
  usb,
  bluetooth,
  wifi,
  ethernet,
  builtIn,
  virtualDevice,
  unknown,
}

enum DeviceStatus { connected, disconnected, unavailable, error }

class DeviceModel {
  final String id;
  final String name;
  final DeviceType type;
  final DeviceStatus status;
  final DeviceConnectionType connectionType;
  final String manufacturer;
  final String model;
  final String serialNumber;
  final String vendorId;
  final String productId;
  final bool selected;
  final DateTime? lastSeen;

  const DeviceModel({
    required this.id,
    required this.name,
    required this.type,
    required this.status,
    required this.connectionType,
    this.manufacturer = "",
    this.model = "",
    this.serialNumber = "",
    this.vendorId = "",
    this.productId = "",
    this.selected = false,
    this.lastSeen,
  });

  bool get isConnected => status == DeviceStatus.connected;

  DeviceModel copyWith({
    String? id,
    String? name,
    DeviceType? type,
    DeviceStatus? status,
    DeviceConnectionType? connectionType,
    String? manufacturer,
    String? model,
    String? serialNumber,
    String? vendorId,
    String? productId,
    bool? selected,
    DateTime? lastSeen,
  }) {
    return DeviceModel(
      id: id ?? this.id,
      name: name ?? this.name,
      type: type ?? this.type,
      status: status ?? this.status,
      connectionType: connectionType ?? this.connectionType,
      manufacturer: manufacturer ?? this.manufacturer,
      model: model ?? this.model,
      serialNumber: serialNumber ?? this.serialNumber,
      vendorId: vendorId ?? this.vendorId,
      productId: productId ?? this.productId,
      selected: selected ?? this.selected,
      lastSeen: lastSeen ?? this.lastSeen,
    );
  }

  factory DeviceModel.fromJson(Map<String, dynamic> json) {
    return DeviceModel(
      id: json["id"] ?? "",
      name: json["name"] ?? "",
      manufacturer: json["manufacturer"] ?? "",
      model: json["model"] ?? "",
      serialNumber: json["serialNumber"] ?? "",
      vendorId: json["vendorId"] ?? "",
      productId: json["productId"] ?? "",
      selected: json["selected"] ?? false,
      lastSeen: json["lastSeen"] != null
          ? DateTime.tryParse(json["lastSeen"])
          : null,
      type: DeviceType.values.firstWhere(
        (e) => e.name == json["type"],
        orElse: () => DeviceType.unknown,
      ),
      status: DeviceStatus.values.firstWhere(
        (e) => e.name == json["status"],
        orElse: () => DeviceStatus.unavailable,
      ),
      connectionType: DeviceConnectionType.values.firstWhere(
        (e) => e.name == json["connectionType"],
        orElse: () => DeviceConnectionType.unknown,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "name": name,
      "manufacturer": manufacturer,
      "model": model,
      "serialNumber": serialNumber,
      "vendorId": vendorId,
      "productId": productId,
      "selected": selected,
      "lastSeen": lastSeen?.toIso8601String(),
      "type": type.name,
      "status": status.name,
      "connectionType": connectionType.name,
    };
  }

  @override
  String toString() {
    return "DeviceModel(name: $name, type: ${type.name}, status: ${status.name})";
  }
}
