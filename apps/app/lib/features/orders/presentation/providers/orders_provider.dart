import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/orders_page_response.dart';
import '../../data/repositories/orders_repository.dart';
import 'orders_query_provider.dart';

final ordersRepositoryProvider = Provider<OrdersRepository>((ref) {
  return OrdersRepository();
});

final ordersProvider = FutureProvider<OrdersPageResponse>((ref) async {
  final query = ref.watch(ordersQueryProvider);

  return ref.read(ordersRepositoryProvider).getOrders(query);
});
