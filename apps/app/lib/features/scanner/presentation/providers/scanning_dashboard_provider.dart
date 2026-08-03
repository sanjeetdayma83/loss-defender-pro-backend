import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/scanning_dashboard_repository.dart';

class ScanningDashboardState {
  final bool loading;
  final String error;
  final Map<String, dynamic>? currentScanResult;
  final List<Map<String, dynamic>> recentScans;
  final Map<String, dynamic> summaryStats;

  ScanningDashboardState({
    this.loading = false,
    this.error = '',
    this.currentScanResult,
    this.recentScans = const [],
    this.summaryStats = const {
      "totalScans": 0, "successRate": 0, "verified": 0, "pending": 0, "exceptions": 0
    },
  });

  ScanningDashboardState copyWith({
    bool? loading,
    String? error,
    Map<String, dynamic>? currentScanResult,
    List<Map<String, dynamic>>? recentScans,
    Map<String, dynamic>? summaryStats,
  }) {
    return ScanningDashboardState(
      loading: loading ?? this.loading,
      error: error ?? this.error,
      currentScanResult: currentScanResult ?? this.currentScanResult,
      recentScans: recentScans ?? this.recentScans,
      summaryStats: summaryStats ?? this.summaryStats,
    );
  }
}

final scanningDashboardProvider = StateNotifierProvider<ScanningDashboardNotifier, ScanningDashboardState>((ref) {
  return ScanningDashboardNotifier(ScanningDashboardRepository());
});

class ScanningDashboardNotifier extends StateNotifier<ScanningDashboardState> {
  final ScanningDashboardRepository _repository;

  ScanningDashboardNotifier(this._repository) : super(ScanningDashboardState()) {
    loadSummary();
  }

  Future<void> loadSummary() async {
    final stats = await _repository.getDashboardSummary();
    state = state.copyWith(summaryStats: stats);
  }

  Future<void> processBarcode(String barcode) async {
    if (barcode.trim().isEmpty) return;
    
    state = state.copyWith(loading: true, error: '');

    try {
      final result = await _repository.processGlobalScan(barcode.trim());
      
      // Add to recent scans list (at the top)
      final updatedScans = [
        {"barcode": barcode, ...result},
        ...state.recentScans
      ].take(10).toList(); // Keep only last 10 scans

      state = state.copyWith(
        loading: false,
        currentScanResult: result,
        recentScans: updatedScans,
      );
    } catch (e) {
      // Record failed scan
      final failedScan = {
        "barcode": barcode,
        "status": "Exception",
        "orderId": "UNKNOWN",
        "time": DateTime.now().toLocal().toString().split('.')[0]
      };
      
      final updatedScans = [failedScan, ...state.recentScans].take(10).toList();

      state = state.copyWith(
        loading: false,
        error: e.toString().replaceAll("Exception: ", ""),
        currentScanResult: null,
        recentScans: updatedScans,
      );
    }
  }
}
