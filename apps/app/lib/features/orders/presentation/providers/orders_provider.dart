import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'orders_query_provider.dart';

final ordersProvider = Provider<OrdersQueryState>((ref) {
  return ref.watch(ordersQueryProvider);
});
