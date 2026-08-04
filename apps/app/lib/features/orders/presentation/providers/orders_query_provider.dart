import 'package:flutter_riverpod/flutter_riverpod.dart';

class OrdersQueryState {
  final bool isLoading;
  final List<Map<String, dynamic>> orders;
  final Object? error;

  OrdersQueryState({this.isLoading = false, this.orders = const [], this.error});
  
  OrdersQueryState copyWith({bool? isLoading, List<Map<String, dynamic>>? orders, Object? error}) {
    return OrdersQueryState(
      isLoading: isLoading ?? this.isLoading,
      orders: orders ?? this.orders,
      error: error ?? this.error,
    );
  }

  R when<R>({
    required R Function(List<Map<String, dynamic>> orders) data,
    required R Function(Object error, StackTrace stackTrace) error,
    required R Function() loading,
  }) {
    if (isLoading) return loading();
    if (this.error != null) return error(this.error!, StackTrace.empty);
    return data(orders);
  }
}

class OrdersQueryNotifier extends Notifier<OrdersQueryState> {
  @override
  OrdersQueryState build() => OrdersQueryState();

  void setOrders(List<Map<String, dynamic>> orders) {
    state = state.copyWith(orders: orders, isLoading: false);
  }
}

final ordersQueryProvider = NotifierProvider<OrdersQueryNotifier, OrdersQueryState>(OrdersQueryNotifier.new);

