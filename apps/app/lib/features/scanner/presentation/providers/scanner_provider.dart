import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/scan_feedback.dart';
import '../../data/models/scan_session.dart';
import '../../data/models/scanned_item.dart';
import '../../data/repositories/scanner_repository.dart';

final scannerRepositoryProvider = Provider<ScannerRepository>(
  (ref) => ScannerRepository(),
);

class ScannerState {
  final bool loading;
  final String orderId;

  final List<ScannedItem> expectedItems;
  final List<String> scannedHistory;

  final String lastScan;
  final String message;

  final bool completed;

  final ScanFeedback? feedback;

  const ScannerState({
    this.loading = false,
    this.orderId = "",
    this.expectedItems = const [],
    this.scannedHistory = const [],
    this.lastScan = "",
    this.message = "",
    this.completed = false,
    this.feedback,
  });

  double get progress {
    if (expectedItems.isEmpty) return 0;

    int verified = 0;
    int expected = 0;

    for (final item in expectedItems) {
      verified += item.scannedQty;
      expected += item.expectedQty;
    }

    if (expected == 0) return 0;

    return verified / expected;
  }

  int get totalExpected {
    return expectedItems.fold(0, (sum, item) => sum + item.expectedQty);
  }

  int get totalVerified {
    return expectedItems.fold(0, (sum, item) => sum + item.scannedQty);
  }

  ScannerState copyWith({
    bool? loading,
    String? orderId,
    List<ScannedItem>? expectedItems,
    List<String>? scannedHistory,
    String? lastScan,
    String? message,
    bool? completed,
    ScanFeedback? feedback,
  }) {
    return ScannerState(
      loading: loading ?? this.loading,
      orderId: orderId ?? this.orderId,
      expectedItems: expectedItems ?? this.expectedItems,
      scannedHistory: scannedHistory ?? this.scannedHistory,
      lastScan: lastScan ?? this.lastScan,
      message: message ?? this.message,
      completed: completed ?? this.completed,
      feedback: feedback ?? this.feedback,
    );
  }
}

class ScannerNotifier extends StateNotifier<ScannerState> {
  final ScannerRepository repository;

  ScanSession _session = const ScanSession();

  ScannerNotifier(this.repository) : super(const ScannerState());

  Future<void> loadOrder(String orderId) async {
    state = state.copyWith(loading: true, message: "", feedback: null);

    try {
      final json = await repository.loadOrder(orderId);

      final List items = json["items"] ?? [];

      state = state.copyWith(
        loading: false,
        orderId: orderId,
        expectedItems: items
            .map(
              (e) => ScannedItem(
                sku: e["sku"] ?? "",
                title: e["title"] ?? "",
                expectedQty: e["quantity"] ?? 0,
                scannedQty: e["verifiedQty"] ?? 0,
              ),
            )
            .toList(),
      );
    } catch (e) {
      state = state.copyWith(
        loading: false,
        message: e.toString(),
        feedback: ScanFeedback.error(e.toString()),
      );
    }
  }

  Future<void> scanSku(String sku) async {
    if (state.loading) return;

    // Ignore rapid duplicate scans
    if (_session.shouldIgnore(sku)) {
      return;
    }

    _session = _session.next(sku);

    final history = [...state.scannedHistory];
    history.insert(0, sku);

    state = state.copyWith(
      loading: true,
      scannedHistory: history,
      lastScan: sku,
    );

    try {
      await repository.verifyScan(orderId: state.orderId, sku: sku);

      final json = await repository.loadOrder(state.orderId);

      final List items = json["items"] ?? [];

      final scannedItems = items
          .map(
            (e) => ScannedItem(
              sku: e["sku"] ?? "",
              title: e["title"] ?? "",
              expectedQty: e["quantity"] ?? 0,
              scannedQty: e["verifiedQty"] ?? 0,
            ),
          )
          .toList();

      final completed = scannedItems.every((item) => item.completed);

      state = state.copyWith(
        loading: false,
        expectedItems: scannedItems,
        completed: completed,
        message: "Verified",
        feedback: ScanFeedback.success(sku),
      );
    } catch (e) {
      state = state.copyWith(
        loading: false,
        message: e.toString(),
        feedback: ScanFeedback.error(e.toString()),
      );
    }
  }

  Future<void> completeVerification() async {
    try {
      await repository.finishVerification(state.orderId);

      state = state.copyWith(
        completed: true,
        message: "Verification Completed",
      );
    } catch (e) {
      state = state.copyWith(
        message: e.toString(),
        feedback: ScanFeedback.error(e.toString()),
      );
    }
  }

  Future<void> reload() async {
    if (state.orderId.isEmpty) return;

    await loadOrder(state.orderId);
  }

  void clearFeedback() {
    state = state.copyWith(feedback: null);
  }

  void reset() {
    _session = const ScanSession();
    state = const ScannerState();
  }
}

final scannerProvider = StateNotifierProvider<ScannerNotifier, ScannerState>(
  (ref) => ScannerNotifier(ref.read(scannerRepositoryProvider)),
);
