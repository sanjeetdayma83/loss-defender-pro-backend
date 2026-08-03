import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/warehouses_model.dart';
import '../../data/repositories/warehouses_repository.dart';

final warehouseRepositoryProvider = Provider((ref) => WarehousesRepository());

final warehouseProvider = FutureProvider<List<WarehousesModel>>((ref) {
  return ref.read(warehouseRepositoryProvider).getWarehouses();
});
