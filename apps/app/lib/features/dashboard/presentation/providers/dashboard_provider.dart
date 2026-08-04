import 'package:flutter_riverpod/flutter_riverpod.dart';

class DashboardState {
  final bool isLoading;
  final Map<String, dynamic> data;
  DashboardState({this.isLoading = false, this.data = const {}});
  
  DashboardState copyWith({bool? isLoading, Map<String, dynamic>? data}) {
    return DashboardState(
      isLoading: isLoading ?? this.isLoading,
      data: data ?? this.data,
    );
  }
}

class DashboardNotifier extends Notifier<DashboardState> {
  @override
  DashboardState build() => DashboardState();

  void setData(Map<String, dynamic> data) {
    state = state.copyWith(data: data, isLoading: false);
  }
}

final dashboardProvider = NotifierProvider<DashboardNotifier, DashboardState>(DashboardNotifier.new);
