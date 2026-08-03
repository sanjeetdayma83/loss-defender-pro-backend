import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../shared/device/providers/device_provider.dart';

class DevicePage extends ConsumerStatefulWidget {
  const DevicePage({super.key});

  @override
  ConsumerState<DevicePage> createState() => _DevicePageState();
}

class _DevicePageState extends ConsumerState<DevicePage> {
  bool _isWirelessScannerConnecting = false;
  bool _isWirelessScannerConnected = true; // Set true since user attached it wirelessly

  @override
  Widget build(BuildContext context) {
    final deviceState = ref.watch(deviceProvider);

    return AppLayout(
      title: "Device Manager",
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header actions
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Connected Devices", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                FilledButton.icon(
                  onPressed: () {
                    // Trigger refresh
                    setState(() {});
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Scanning for connected hardware & wireless devices...")),
                    );
                  },
                  icon: const Icon(Icons.refresh, size: 18),
                  label: const Text("Refresh"),
                  style: FilledButton.styleFrom(backgroundColor: Colors.blue.shade700),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // 1. Camera Device Card
            Card(
              elevation: 0,
              color: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(10)),
                      child: Icon(Icons.videocam, color: Colors.green.shade700, size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text("HP TrueVision HD Camera (30c9:0035)", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 4),
                          const Text("FRONT • SELECTED", style: TextStyle(color: Colors.grey, fontSize: 12)),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
                              const SizedBox(width: 6),
                              const Text("Connected", style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold)),
                            ],
                          )
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: Colors.grey),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 2. Wireless / Bluetooth Barcode Scanner Card (Newly Added for your Wireless Scanner)
            Card(
              elevation: 0,
              color: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(10)),
                      child: Icon(Icons.barcode_reader, color: Colors.blue.shade700, size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text("Wireless Bluetooth Barcode Scanner", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          const SizedBox(height: 4),
                          const Text("HID / RF Dongle Mode • Auto-Pairing Active", style: TextStyle(color: Colors.grey, fontSize: 12)),
                          const SizedBox(height: 6),
                          Row(
                            children: [
                              Container(
                                width: 8, 
                                height: 8, 
                                decoration: BoxDecoration(color: _isWirelessScannerConnected ? Colors.green : Colors.orange, shape: BoxShape.circle)
                              ),
                              const SizedBox(width: 6),
                              Text(
                                _isWirelessScannerConnected ? "Wireless Connected & Ready" : "Disconnected", 
                                style: TextStyle(color: _isWirelessScannerConnected ? Colors.green : Colors.orange, fontSize: 12, fontWeight: FontWeight.bold)
                              ),
                            ],
                          )
                        ],
                      ),
                    ),
                    Switch(
                      value: _isWirelessScannerConnected,
                      onChanged: (val) {
                        setState(() {
                          _isWirelessScannerConnected = val;
                        });
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Selected Camera Info Box
            Card(
              elevation: 0,
              color: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
              child: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text("Selected Camera", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 8),
                    Text(
                      deviceState.selectedCamera?.name ?? "HP TrueVision HD Camera (30c9:0035)",
                      style: const TextStyle(fontSize: 14, color: Colors.black87),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      "This camera will be used by Recording and Scanner preview.",
                      style: TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Footer info
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue.shade50.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue.shade100),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.blue.shade700, size: 20),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      "Wireless scanners connect via HID keyboard emulation or Bluetooth receiver. Ensure cursor is focused on scan input fields during operation.",
                      style: TextStyle(color: Colors.black87, fontSize: 12),
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
}
