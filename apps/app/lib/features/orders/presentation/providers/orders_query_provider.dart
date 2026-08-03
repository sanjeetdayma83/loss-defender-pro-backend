import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/orders_query.dart';

class OrdersQueryNotifier extends StateNotifier<OrdersQuery> {
  OrdersQueryNotifier() : super(const OrdersQuery());

  void search(String value) {
    state = state.copyWith(search: value, page: 1);
  }

  void changePage(int page) {
    state = state.copyWith(page: page);
  }

  void changeMarketplace(String? value) {
    state = state.copyWith(marketplace: value, page: 1);
  }

  void changeStatus(String? value) {
    state = state.copyWith(status: value, page: 1);
  }

  void changePriority(String? value) {
    state = state.copyWith(priority: value, page: 1);
  }
}

final ordersQueryProvider =
    StateNotifierProvider<OrdersQueryNotifier, OrdersQuery>(
      (ref) => OrdersQueryNotifier(),
    );
