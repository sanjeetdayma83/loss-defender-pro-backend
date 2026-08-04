import 'package:flutter_riverpod/flutter_riverpod.dart';

class ScanningDashboardState {
  final bool isLoading;
  final List<Map<String, dynamic>> scans;
  ScanningDashboardState({this.isLoading = false, this.scans = const []});
  
  ScanningDashboardState copyWith({bool? isLoading, List<Map<String, dynamic>>? scans}) {
    return ScanningDashboardState(
      isLoading: isLoading ?? this.isLoading,
      scans: scans ?? this.scans,
    );
  }
}

class ScanningDashboardNotifier extends Notifier<ScanningDashboardState> {
  @override
  ScanningDashboardState build() => ScanningDashboardState();

  void setData(List<Map<String, dynamic>> scans) {
    state = state.copyWith(scans: scans, isLoading: false);
  }
}

final scanningDashboardProvider = NotifierProvider<ScanningDashboardNotifier, ScanningDashboardState>(ScanningDashboardNotifier.new);
