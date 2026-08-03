import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/layout/app_layout.dart';
import '../../../../shared/device/providers/device_provider.dart';
import '../../../../shared/device/widgets/device_status_card.dart';
import '../../../../shared/device/widgets/device_selector_dialog.dart';

class DevicePage extends ConsumerStatefulWidget {
  const DevicePage({super.key});

  @override
  ConsumerState<DevicePage> createState() => _DevicePageState();
}

class _DevicePageState extends ConsumerState<DevicePage> {
  @override
  void initState() {
    super.initState();

    Future.microtask(() {
      ref.read(deviceProvider.notifier).loadDevices();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(deviceProvider);

    return AppLayout(
      title: "Device Manager",
      child: RefreshIndicator(
        onRefresh: () async {
          await ref.read(deviceProvider.notifier).refresh();
        },
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            Row(
              children: [
                Text(
                  "Connected Devices",
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const Spacer(),
                FilledButton.icon(
                  onPressed: () {
                    ref.read(deviceProvider.notifier).refresh();
                  },
                  icon: const Icon(Icons.refresh),
                  label: const Text("Refresh"),
                ),
              ],
            ),

            const SizedBox(height: 24),

            if (state.loading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(40),
                  child: CircularProgressIndicator(),
                ),
              ),

            if (state.error.isNotEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Text(state.error),
                ),
              ),

            if (!state.loading && state.cameras.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(40),
                  child: Center(
                    child: Text("No Camera Detected"),
                  ),
                ),
              ),            if (state.cameras.isNotEmpty)
              ...state.cameras.map((camera) {
                final selected =
                    state.selectedCamera?.name == camera.name;

                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: DeviceStatusCard(
                    icon: Icons.videocam,
                    title: camera.name.isEmpty
                        ? "Unknown Camera"
                        : camera.name,
                    subtitle:
                        "${camera.lensDirection.name.toUpperCase()} • ${selected ? "SELECTED" : "AVAILABLE"}",
                    connected: true,
                    onTap: () async {
                      await showDialog(
                        context: context,
                        builder: (_) => DeviceSelectorDialog(
                          cameras: state.cameras,
                          selected: state.selectedCamera,
                          onSelected: (camera) async {
                            await ref
                                .read(deviceProvider.notifier)
                                .selectCamera(camera);
                          },
                        ),
                      );
                    },
                  ),
                );
              }),

            const SizedBox(height: 30),

            Card(
              elevation: 2,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      "Selected Camera",
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 12),

                    Text(
                      state.selectedCamera?.name ??
                          "No Camera Selected",
                      style: const TextStyle(fontSize: 16),
                    ),

                    const SizedBox(height: 8),

                    Text(
                      state.selectedCamera == null
                          ? "Select a camera before recording or scanning."
                          : "This camera will be used by Recording and Scanner.",
                      style: TextStyle(
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    const Icon(
                      Icons.info_outline,
                      color: Colors.blue,
                    ),

                    const SizedBox(width: 12),

                    Expanded(
                      child: Text(
                        "Future support: Honeywell, Zebra, Datalogic scanners, USB printers, microphones, RFID readers and weighing scales.",
                        style: TextStyle(
                          color: Colors.grey.shade700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}


flutter analyze

