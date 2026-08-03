import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/layout/app_layout.dart';
import '../../../../shared/device/providers/device_provider.dart';
import '../providers/scanning_dashboard_provider.dart';

class ScanningDashboardPage extends ConsumerStatefulWidget {
  const ScanningDashboardPage({super.key});

  @override
  ConsumerState<ScanningDashboardPage> createState() => _ScanningDashboardPageState();
}

class _ScanningDashboardPageState extends ConsumerState<ScanningDashboardPage> {
  final TextEditingController _hiddenInputController = TextEditingController();
  final FocusNode _hiddenFocusNode = FocusNode();
  
  // Real-time listener status for HID Scanner
  bool _isScannerReady = false;

  @override
  void initState() {
    super.initState();
    
    // HID Scanner Connection Logic (Relies on Window/Input Focus)
    _hiddenFocusNode.addListener(() {
      if (mounted) {
        setState(() {
          _isScannerReady = _hiddenFocusNode.hasFocus;
        });
      }
    });

    Future.delayed(const Duration(milliseconds: 100), () {
      if (mounted) _hiddenFocusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _hiddenInputController.dispose();
    _hiddenFocusNode.dispose();
    super.dispose();
  }

  void _handleScan(String barcode) {
    if (barcode.trim().isNotEmpty) {
      ref.read(scanningDashboardProvider.notifier).processBarcode(barcode);
    }
    _hiddenInputController.clear();
    _hiddenFocusNode.requestFocus(); // Keep focus after scan
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(scanningDashboardProvider);
    final lastBarcode = state.recentScans.isNotEmpty ? state.recentScans.first['barcode']?.toString() : null;

    return GestureDetector(
      onTap: () => _hiddenFocusNode.requestFocus(),
      child: AppLayout(
        title: "Scanning",
        child: Stack(
          children: [
            // The Invisible HID Scanner Listener
            Opacity(
              opacity: 0,
              child: TextField(
                controller: _hiddenInputController,
                focusNode: _hiddenFocusNode,
                autofocus: true,
                onSubmitted: _handleScan,
              ),
            ),
            
            LayoutBuilder(
              builder: (context, constraints) {
                // Determine if screen is wide enough for split-view
                final isDesktop = constraints.maxWidth > 950;

                return SingleChildScrollView(
                  padding: const EdgeInsets.all(24.0),
                  child: isDesktop 
                      ? _buildDesktopLayout(context, state, lastBarcode)
                      : _buildMobileLayout(context, state, lastBarcode),
                );
              }
            ),
          ],
        ),
      ),
    );
  }

  // ==========================================
  // DESKTOP LAYOUT (Full Screen)
  // ==========================================
  Widget _buildDesktopLayout(BuildContext context, ScanningDashboardState state, String? lastBarcode) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // LEFT COLUMN
        Expanded(
          flex: 6,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildScannerCard(state.loading, lastBarcode),
              const SizedBox(height: 24),
              _buildRecentScansTable(state.recentScans),
            ],
          ),
        ),
        
        const SizedBox(width: 24),
        
        // RIGHT COLUMN
        Expanded(
          flex: 4,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _buildDeviceStatus(context),
              const SizedBox(height: 24),
              _buildScanResultCard(state),
              const SizedBox(height: 24),
              _buildSummaryCard(state.summaryStats),
            ],
          ),
        ),
      ],
    );
  }

  // ==========================================
  // MOBILE / SPLIT-SCREEN LAYOUT (Narrow)
  // ==========================================
  Widget _buildMobileLayout(BuildContext context, ScanningDashboardState state, String? lastBarcode) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Priority Items on Top
        _buildDeviceStatus(context),
        const SizedBox(height: 16),
        _buildSummaryCard(state.summaryStats),
        const SizedBox(height: 24),
        
        // Core Scanning Area
        _buildScannerCard(state.loading, lastBarcode),
        const SizedBox(height: 24),
        
        // Results & History
        _buildScanResultCard(state),
        const SizedBox(height: 24),
        _buildRecentScansTable(state.recentScans),
      ],
    );
  }

  // ==========================================
  // WIDGET COMPONENTS (Fully Dynamic/Live)
  // ==========================================

  Widget _buildScannerCard(bool isLoading, String? lastBarcode) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  "Scan Barcode / QR Code", 
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)
                ),
                if (isLoading) const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)),
              ],
            ),
            const SizedBox(height: 16),
            
            GestureDetector(
              onTap: () => _hiddenFocusNode.requestFocus(),
              child: ScannerAnimationWidget(
                lastScannedCode: lastBarcode,
                isActive: _isScannerReady, // Bound to live focus
              ),
            ),

            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.flash_off, color: Colors.grey, size: 20),
                    const SizedBox(width: 8),
                    const Text("Flash", style: TextStyle(color: Colors.grey)),
                    Switch(value: false, onChanged: (v) {}), // Placeholder for actual hardware flash if integrating native camera later
                  ],
                ),
                Flexible(
                  child: Text(
                    _isScannerReady ? "Place barcode within the frame" : "Click here to reconnect scanner input", 
                    style: TextStyle(color: _isScannerReady ? Colors.grey : Colors.red),
                    textAlign: TextAlign.right,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentScansTable(List<Map<String, dynamic>> scans) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Recent Scans", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                TextButton(onPressed: () {}, child: const Text("View All")),
              ],
            ),
            const SizedBox(height: 16),
            scans.isEmpty
                ? const Padding(
                    padding: EdgeInsets.all(24.0),
                    child: Center(child: Text("Waiting for live API data...", style: TextStyle(color: Colors.grey))),
                  )
                : SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: DataTable(
                      headingRowColor: WidgetStateProperty.all(Colors.grey.shade50),
                      columns: const [
                        DataColumn(label: Text("Barcode")),
                        DataColumn(label: Text("Order ID")),
                        DataColumn(label: Text("Status")),
                        DataColumn(label: Text("Time")),
                      ],
                      rows: scans.map((scan) {
                        final isSuccess = scan["status"] == "Verified";
                        return DataRow(
                          cells: [
                            DataCell(Text(scan["barcode"].toString())),
                            DataCell(Text(scan["orderId"].toString())),
                            DataCell(
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: (isSuccess ? Colors.green : Colors.red).withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(scan["status"], style: TextStyle(color: isSuccess ? Colors.green : Colors.red, fontSize: 12)),
                              ),
                            ),
                            DataCell(Text(scan["time"].toString(), style: const TextStyle(color: Colors.grey))),
                          ],
                        );
                      }).toList(),
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildDeviceStatus(BuildContext context) {
    // deviceState gets real camera data from system
    final deviceState = ref.watch(deviceProvider); 
    
    return Row(
      children: [
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.usb, color: Colors.blue, size: 20),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("HID Scanner", style: TextStyle(fontSize: 11, color: Colors.grey)),
                        Row(
                          children: [
                            Container(width: 6, height: 6, decoration: BoxDecoration(color: _isScannerReady ? Colors.green : Colors.red, shape: BoxShape.circle)),
                            const SizedBox(width: 4),
                            Expanded(child: Text(_isScannerReady ? "Ready" : "Offline", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12), overflow: TextOverflow.ellipsis)),
                          ],
                        )
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.videocam, color: Colors.blue, size: 20),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("System Camera", style: TextStyle(fontSize: 11, color: Colors.grey)),
                        Row(
                          children: [
                            Container(width: 6, height: 6, decoration: BoxDecoration(color: deviceState.selectedCamera != null ? Colors.green : Colors.red, shape: BoxShape.circle)),
                            const SizedBox(width: 4),
                            Expanded(child: Text(deviceState.selectedCamera != null ? "Active" : "Not Found", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12), overflow: TextOverflow.ellipsis)),
                          ],
                        )
                      ],
                    ),
                  )
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildScanResultCard(ScanningDashboardState state) {
    final result = state.currentScanResult;
    final hasError = state.error.isNotEmpty;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Live Scan Result", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            
            if (result == null && !hasError)
              Container(
                height: 150,
                alignment: Alignment.center,
                decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(12)),
                child: const Text("Waiting for API response...", style: TextStyle(color: Colors.grey)),
              )
            else if (hasError)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.red.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: [
                    const Icon(Icons.error, color: Colors.red, size: 28),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text("API Exception Detected", style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 14)),
                          Text(state.error, style: const TextStyle(color: Colors.red, fontSize: 12)),
                        ],
                      ),
                    )
                  ],
                ),
              )
            else ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: [
                    const Icon(Icons.cloud_done, color: Colors.green, size: 28),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text("Valid Order", style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 14)),
                          Text("Synced with backend successfully", style: TextStyle(color: Colors.green, fontSize: 12)),
                        ],
                      ),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 24),
              // Data driven purely from the API Provider state
              _buildResultRow("Order ID", result!["orderId"]?.toString() ?? "N/A"),
              _buildResultRow("AWB / Tracking", result["awb"]?.toString() ?? "N/A"),
              _buildResultRow("Customer", result["customer"]?.toString() ?? "N/A"),
              _buildResultRow("Item", result["item"]?.toString() ?? "N/A"),
              _buildResultRow("Quantity", "${result["quantity"] ?? 0} Pcs"),
              _buildResultRow("Server Time", result["time"]?.toString() ?? "N/A"),
              
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 44,
                child: FilledButton(
                  onPressed: () {}, 
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.blue.shade700,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))
                  ),
                  child: const Text("View Order Details")
                ),
              )
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildResultRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              value, 
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(Map<String, dynamic> stats) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("Live API Summary", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade200), borderRadius: BorderRadius.circular(12)),
                    child: Column(
                      children: [
                        const Icon(Icons.api, color: Colors.blue, size: 20),
                        const SizedBox(height: 4),
                        // Data from Provider
                        Text(stats["totalScans"].toString(), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        const Text("Total Synced", style: TextStyle(color: Colors.grey, fontSize: 11)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade200), borderRadius: BorderRadius.circular(12)),
                    child: Column(
                      children: [
                        Text("${stats["successRate"]}%", style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.green)),
                        const SizedBox(height: 4),
                        const Text("Success Rate", style: TextStyle(color: Colors.grey, fontSize: 11)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ==========================================
// Custom Animated Barcode Scanner UI
// ==========================================
class ScannerAnimationWidget extends StatefulWidget {
  final String? lastScannedCode;
  final bool isActive;

  const ScannerAnimationWidget({super.key, this.lastScannedCode, required this.isActive});

  @override
  State<ScannerAnimationWidget> createState() => _ScannerAnimationWidgetState();
}

class _ScannerAnimationWidgetState extends State<ScannerAnimationWidget> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  final List<double> barcodeLines = [2, 4, 1, 3, 2, 1, 1, 4, 2, 3, 1, 2, 4, 1, 2, 1, 3, 2, 4, 1, 2, 1, 1, 3, 2];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 2));
    _animation = Tween<double>(begin: 0.0, end: 1.0).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
    if (widget.isActive) _controller.repeat(reverse: true);
  }

  @override
  void didUpdateWidget(ScannerAnimationWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive && !_controller.isAnimating) {
      _controller.repeat(reverse: true);
    } else if (!widget.isActive && _controller.isAnimating) {
      _controller.stop();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 380,
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF1E2329), 
        borderRadius: BorderRadius.circular(16),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Positioned(top: 20, left: 20, child: _buildCorner(isTop: true, isLeft: true)),
          Positioned(top: 20, right: 20, child: _buildCorner(isTop: true, isLeft: false)),
          Positioned(bottom: 20, left: 20, child: _buildCorner(isTop: false, isLeft: true)),
          Positioned(bottom: 20, right: 20, child: _buildCorner(isTop: false, isLeft: false)),

          Container(
            width: 280,
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: barcodeLines.map((width) {
                    return Container(width: width * 2, height: 80, margin: const EdgeInsets.only(right: 2), color: Colors.black);
                  }).toList(),
                ),
                const SizedBox(height: 12),
                Text(
                  widget.lastScannedCode ?? "AWAITING SCAN",
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 2, fontFamily: 'monospace'),
                )
              ],
            ),
          ),

          if (widget.isActive)
            AnimatedBuilder(
              animation: _animation,
              builder: (context, child) {
                final topPosition = 60 + (_animation.value * 260);
                return Positioned(
                  top: topPosition, left: 0, right: 0,
                  child: Container(
                    height: 2,
                    decoration: BoxDecoration(
                      color: Colors.blueAccent,
                      boxShadow: [
                        BoxShadow(color: Colors.blueAccent.withValues(alpha: 0.8), blurRadius: 10, spreadRadius: 3),
                        BoxShadow(color: Colors.white.withValues(alpha: 0.5), blurRadius: 2, spreadRadius: 1)
                      ],
                    ),
                  ),
                );
              },
            ),

            if (!widget.isActive)
              Container(
                decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.6), borderRadius: BorderRadius.circular(16)),
                child: const Center(
                  child: Text(
                    "HID Connection Paused\n(Click to restore)",
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              )
        ],
      ),
    );
  }

  Widget _buildCorner({required bool isTop, required bool isLeft}) {
    return Container(
      width: 40, height: 40,
      decoration: BoxDecoration(
        border: Border(
          top: isTop ? const BorderSide(color: Colors.white54, width: 2) : BorderSide.none,
          bottom: !isTop ? const BorderSide(color: Colors.white54, width: 2) : BorderSide.none,
          left: isLeft ? const BorderSide(color: Colors.white54, width: 2) : BorderSide.none,
          right: !isLeft ? const BorderSide(color: Colors.white54, width: 2) : BorderSide.none,
        ),
      ),
    );
  }
}
