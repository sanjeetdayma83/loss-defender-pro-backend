class OrderModel {
  final String id;
  final String orderNumber;
  final String marketplace;
  final String customerName;
  final String status;
  final String warehouse;
  final DateTime createdAt;

  const OrderModel({
    required this.id,
    required this.orderNumber,
    required this.marketplace,
    required this.customerName,
    required this.status,
    required this.warehouse,
    required this.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json["id"]?.toString() ?? "",
      orderNumber: json["orderNumber"] ?? "",
      marketplace: json["marketplace"] ?? "",
      customerName: json["customerName"] ?? "",
      status: json["status"] ?? "",
      warehouse: json["warehouseName"] ?? "",
      createdAt:
          DateTime.tryParse(json["createdAt"]?.toString() ?? "") ??
          DateTime.now(),
    );
  }
}
