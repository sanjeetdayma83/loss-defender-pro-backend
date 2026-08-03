import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../../../shared/device/providers/device_provider.dart';
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
  final TextEditingController _hiddenInputController = TextEditingController();
  final FocusNode _hiddenFocusNode = FocusNode();

  bool torch = false;
  bool loaded = false;
  bool processing = false;
  bool useHardwareScanner = true; 

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) _hiddenFocusNode.requestFocus();
    });
  }

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

  Future<void> _processBarcode(String value) async {
    if (processing || value.trim().isEmpty) return;
    processing = true;
    await ref.read(scannerProvider.notifier).scanSku(value.trim());
    await Future.delayed(const Duration(milliseconds: 500));
    processing = false;
    
    if (mounted && useHardwareScanner) {
      _hiddenFocusNode.requestFocus();
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
              onUpload: () => Navigator.pop(context),
              onDiscard: () => Navigator.pop(context),
            ),
          ),
        );
      }
      if (mounted) Navigator.pop(context, true);
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

    return GestureDetector(
      onTap: () {
        if (useHardwareScanner) _hiddenFocusNode.requestFocus();
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text("Scanner • ${widget.orderId}"),
          actions: [
            Row(
              children: [
                const Text("Hardware Scanner", style: TextStyle(fontSize: 12)),
                Switch(
                  value: useHardwareScanner,
                  activeColor: Colors.green,
                  onChanged: (val) {
                    setState(() {
                      useHardwareScanner = val;
                      if (val) _hiddenFocusNode.requestFocus();
                    });
                  },
                ),
              ],
            ),
            if (!useHardwareScanner) ...[
              IconButton(
                icon: Icon(torch ? Icons.flash_on : Icons.flash_off),
                onPressed: () async {
                  await controller.toggleTorch();
                  setState(() => torch = !torch);
                },
              ),
              IconButton(
                icon: const Icon(Icons.cameraswitch),
                onPressed: controller.switchCamera,
              ),
            ]
          ],
        ),
        body: Stack(
          children: [
            Opacity(
              opacity: 0,
              child: TextField(
                controller: _hiddenInputController,
                focusNode: _hiddenFocusNode,
                autofocus: true,
                onSubmitted: (val) {
                  _processBarcode(val);
                  _hiddenInputController.clear();
                  _hiddenFocusNode.requestFocus();
                },
              ),
            ),
            
            if (state.loading && state.expectedItems.isEmpty)
              const Center(child: CircularProgressIndicator())
            else
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    OrderSummaryCard(
                      orderId: state.orderId,
                      expected: state.totalExpected,
                      verified: state.totalVerified,
                    ),
                    const SizedBox(height: 12),
                    
                    if (!useHardwareScanner)
                      SizedBox(
                        height: 200,
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(18),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              MobileScanner(
                                controller: controller,
                                onDetect: (capture) async {
                                  final barcode = capture.barcodes.firstOrNull;
                                  if (barcode?.rawValue != null) {
                                    await _processBarcode(barcode!.rawValue!);
                                  }
                                },
                              ),
                              const ScannerOverlay(),
                            ],
                          ),
                        ),
                      )
                    else
                      GestureDetector(
                        onTap: () => _hiddenFocusNode.requestFocus(),
                        child: Container(
                          height: 100, // Reduced height for better fit
                          decoration: BoxDecoration(
                            color: Colors.blue.withValues(alpha: 0.1),
                            border: Border.all(color: Colors.blue, width: 2),
                            borderRadius: BorderRadius.circular(18),
                          ),
                          child: const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.barcode_reader, size: 32, color: Colors.blue),
                                SizedBox(height: 8),
                                Text("Ready for Hardware Scan", style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue)),
                              ],
                            ),
                          ),
                        ),
                      ),

                    const SizedBox(height: 12),
                    ScanFeedbackBanner(feedback: state.feedback),
                    const SizedBox(height: 8),
                    ScanStatusCard(sku: state.lastScan, status: state.message),
                    const SizedBox(height: 12),
                    VerificationProgressCard(progress: state.progress),
                    const SizedBox(height: 12),
                    
                    // The Expanded widget here ensures the lists take EXACTLY the remaining space. Zero overflow.
                    Expanded(
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(child: VerificationItemsCard(items: state.expectedItems)),
                          const SizedBox(width: 16),
                          Expanded(child: ScannedItemsList(items: state.scannedHistory)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _hiddenFocusNode.dispose();
    _hiddenInputController.dispose();
    controller.dispose();
    super.dispose();
  }
}
