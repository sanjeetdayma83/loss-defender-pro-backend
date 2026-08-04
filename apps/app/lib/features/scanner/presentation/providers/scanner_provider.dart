import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/scanned_item.dart';

class ScannerState {
  final bool isLoading;
  final bool loading;
  final bool completed;
  final String? orderId;
  final int totalExpected;
  final int totalVerified;
  final List<ScannedItem> expectedItems;
  final List<String> scannedHistory;
  final dynamic feedback;
  final String? lastScan;
  final String? message;
  final double progress;

  const ScannerState({
    this.isLoading = false,
    this.loading = false,
    this.completed = false,
    this.orderId,
    this.totalExpected = 0,
    this.totalVerified = 0,
    this.expectedItems = const [],
    this.scannedHistory = const [],
    this.feedback,
    this.lastScan,
    this.message,
    this.progress = 0.0,
  });

  ScannerState copyWith({
    bool? isLoading,
    bool? loading,
    bool? completed,
    String? orderId,
    int? totalExpected,
    int? totalVerified,
    List<ScannedItem>? expectedItems,
    List<String>? scannedHistory,
    dynamic feedback,
    String? lastScan,
    String? message,
    double? progress,
  }) {
    return ScannerState(
      isLoading: isLoading ?? this.isLoading,
      loading: loading ?? this.loading,
      completed: completed ?? this.completed,
      orderId: orderId ?? this.orderId,
      totalExpected: totalExpected ?? this.totalExpected,
      totalVerified: totalVerified ?? this.totalVerified,
      expectedItems: expectedItems ?? this.expectedItems,
      scannedHistory: scannedHistory ?? this.scannedHistory,
      feedback: feedback ?? this.feedback,
      lastScan: lastScan ?? this.lastScan,
      message: message ?? this.message,
      progress: progress ?? this.progress,
    );
  }
}

class ScannerNotifier extends Notifier<ScannerState> {

  @override
  ScannerState build() => const ScannerState();

  Future<void> loadOrder(String id) async {

    state = state.copyWith(
      loading: true,
      orderId: id,
    );

    await Future.delayed(const Duration(milliseconds: 200));

    state = state.copyWith(
      loading: false,
      totalExpected: 10,
      totalVerified: 0,
      expectedItems: const [
        ScannedItem(
          sku: 'SKU-001',
          title: 'Sample Product',
          expectedQty: 10,
          scannedQty: 0,
        ),
      ],
    );
  }

  Future<void> scanSku(String sku) async {

    state = state.copyWith(
      loading: true,
      message: 'Scanning...',
    );

    await Future.delayed(const Duration(milliseconds: 100));

    final updatedItems = state.expectedItems.map((item){

      if(item.sku==sku){

        return item.copyWith(
          scannedQty:item.scannedQty+1,
        );

      }

      return item;

    }).toList();

    final verified = state.totalVerified + 1;

    state = state.copyWith(
      loading:false,
      expectedItems:updatedItems,
      scannedHistory:[
        ...state.scannedHistory,
        sku,
      ],
      totalVerified:verified,
      progress: verified / (state.totalExpected == 0 ? 1 : state.totalExpected),
      lastScan:sku,
      message:'Verified',
    );

  }

  Future<void> completeVerification() async{

    state = state.copyWith(
      completed:true,
      message:'Completed',
    );

  }

}

final scannerProvider =
NotifierProvider<ScannerNotifier, ScannerState>(
ScannerNotifier.new,
);
