import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show defaultTargetPlatform, TargetPlatform;
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
  
  // Isko hum initState mein device ke hisaab se set karenge
  late bool useHardwareScanner; 

  // Platform check karne ka smart tareeka (Web browser on mobile ko bhi pakad lega)
  bool get isMobileDevice =>
      defaultTargetPlatform == TargetPlatform.iOS ||
      defaultTargetPlatform == TargetPlatform.android;

  @override
  void initState() {
    super.initState();
    
    // Agar mobile hai toh hardware scanner FALSE rahega (Camera ON)
    // Agar desktop hai toh hardware scanner TRUE rahega
    useHardwareScanner = !isMobileDevice;

    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted && useHardwareScanner) _hiddenFocusNode.requestFocus();
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
          title: Text("Scanner • ${widget.orderId}", style: const TextStyle(fontSize: 16)),
          actions: [
            // Sirf desktop par Hardware Scanner ka toggle dikhayenge
            if (!isMobileDevice)
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
              
            // Agar camera on hai toh torch aur switch camera ke buttons dikhayenge
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
            // Hidden input field for hardware scanner
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
              LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth > 800;
                  
                  // Common header widgets
                  final headerWidgets = [
                    OrderSummaryCard(
                      orderId: state.orderId,
                      expected: state.totalExpected,
                      verified: state.totalVerified,
                    ),
                    const SizedBox(height: 12),
                    
                    // CAMERA VIEW (badi height mobile ke liye)
                    if (!useHardwareScanner)
                      Container(
                        height: isWide ? 250 : 350, // Phone par camera viewport bada rakha hai
                        decoration: BoxDecoration(
                          color: Colors.black,
                          borderRadius: BorderRadius.circular(18),
                        ),
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
                    // HARDWARE SCANNER VIEW (Sirf desktop par)
                    else
                      GestureDetector(
                        onTap: () => _hiddenFocusNode.requestFocus(),
                        child: Container(
                          height: 100,
                          decoration: BoxDecoration(
                            color: Colors.blue.withOpacity(0.1),
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
                  ];

                  // Render logic based on screen width
                  if (isWide) {
                    // DESKTOP/TABLET VIEW (Side-by-side lists)
                    return Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          ...headerWidgets,
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
                    );
                  } else {
                    // MOBILE VIEW (Vertical stacked lists inside a scrollView to prevent RenderFlex overflow)
                    return SingleChildScrollView(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          ...headerWidgets,
                          VerificationItemsCard(items: state.expectedItems),
                          const SizedBox(height: 16),
                          ConstrainedBox(
                             constraints: const BoxConstraints(minHeight: 300, maxHeight: 500),
                             child: ScannedItemsList(items: state.scannedHistory)
                          ),
                        ],
                      ),
                    );
                  }
                },
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
