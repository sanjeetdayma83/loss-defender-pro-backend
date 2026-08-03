import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../../recording/presentation/providers/recording_provider.dart';
import '../../../recording/presentation/widgets/recording_preview.dart';

import '../providers/scanner_provider.dart';

import '../widgets/scan_feedback_banner.dart';
import '../widgets/order_summary_card.dart';
import '../widgets/scan_status_card.dart';
import '../widgets/scanned_items_list.dart';
import '../widgets/scanner_overlay.dart';
import '../widgets/verification_items_card.dart';
import '../widgets/verification_progress_card.dart';

class ScannerPage extends ConsumerStatefulWidget {
  final String orderId;

  const ScannerPage({super.key, required this.orderId});

  @override
  ConsumerState<ScannerPage> createState() => _ScannerPageState();
}

class _ScannerPageState extends ConsumerState<ScannerPage> {
  final MobileScannerController controller = MobileScannerController();

  bool torch = false;
  bool loaded = false;
  bool processing = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    if (!loaded) {
      loaded = true;

      Future.microtask(() async {
        await ref.read(scannerProvider.notifier).loadOrder(widget.orderId);
      });
    }
  }

  Future<void> _finishWorkflow() async {
    if (processing) return;

    processing = true;

    try {
      await ref.read(scannerProvider.notifier).completeVerification();

      await ref.read(recordingProvider.notifier).stopRecording();

      final recording = ref.read(recordingProvider).recordingModel;

      if (!mounted) return;

      if (recording != null && recording.localPath.isNotEmpty) {
        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => RecordingPreview(
              filePath: recording.localPath,
              onUpload: () {
                Navigator.pop(context);
              },
              onDiscard: () {
                Navigator.pop(context);
              },
            ),
          ),
        );
      }

      if (mounted) {
        Navigator.pop(context, true);
      }
    } finally {
      processing = false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(scannerProvider);

    if (state.completed) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _finishWorkflow();
      });
    }

    return Scaffold(
      appBar: AppBar(
        title: Text("Warehouse Scanner • ${widget.orderId}"),
        centerTitle: true,
        actions: [
          IconButton(
            tooltip: "Flash",
            icon: Icon(torch ? Icons.flash_on : Icons.flash_off),
            onPressed: () async {
              await controller.toggleTorch();

              setState(() {
                torch = !torch;
              });
            },
          ),
          IconButton(
            tooltip: "Switch Camera",
            icon: const Icon(Icons.cameraswitch),
            onPressed: controller.switchCamera,
          ),
        ],
      ),

      body: state.loading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                  child: OrderSummaryCard(
                    orderId: state.orderId,
                    expected: state.totalExpected,
                    verified: state.totalVerified,
                  ),
                ),

                const SizedBox(height: 16),

                Expanded(
                  flex: 5,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(18),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          MobileScanner(
                            controller: controller,
                            onDetect: (capture) async {
                              if (processing) return;

                              final barcode = capture.barcodes.firstOrNull;

                              if (barcode == null) return;

                              final value = barcode.rawValue;

                              if (value == null) return;

                              processing = true;

                              await ref
                                  .read(scannerProvider.notifier)
                                  .scanSku(value);

                              await Future.delayed(
                                const Duration(milliseconds: 500),
                              );

                              processing = false;
                            },
                          ),

                          const ScannerOverlay(),
                        ],
                      ),
                    ),
                  ),
                ),

                Expanded(
                  flex: 5,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Column(
                          children: [
                            ScanFeedbackBanner(feedback: state.feedback),

                            ScanStatusCard(
                              sku: state.lastScan,
                              status: state.message,
                            ),
                          ],
                        ),

                        const SizedBox(height: 14),

                        VerificationProgressCard(progress: state.progress),

                        const SizedBox(height: 16),

                        Expanded(
                          child: Row(
                            children: [
                              Expanded(
                                child: VerificationItemsCard(
                                  items: state.expectedItems,
                                ),
                              ),

                              const SizedBox(width: 16),

                              Expanded(
                                child: ScannedItemsList(
                                  items: state.scannedHistory,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}
