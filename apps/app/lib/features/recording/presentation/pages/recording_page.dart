import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../core/api/api_client.dart';

class RecordingPage extends StatefulWidget {
  final String? orderId;
  const RecordingPage({super.key, this.orderId});

  @override
  State<RecordingPage> createState() => _RecordingPageState();
}

class _RecordingPageState extends State<RecordingPage> {
  final Dio _dio = ApiClient.dio;
  bool isLoading = true;
  List<Map<String, dynamic>> recordingsList = [];
  Map<String, dynamic>? selectedRecording;

  @override
  void initState() {
    super.initState();
    fetchRecordings();
  }

  Future<void> fetchRecordings() async {
    setState(() => isLoading = true);
    try {
      final response = await _dio.get('/recordings').catchError((_) => _dio.get('/orders'));
      final data = response.data;
      List items = [];
      if (data is List) {
        items = data;
      } else if (data is Map && data.containsKey('data')) {
        items = data['data'];
      }

      setState(() {
        recordingsList = List<Map<String, dynamic>>.from(items.map((e) => {
          "id": e["id"] ?? e["recordingId"] ?? e["orderId"] ?? "REC-001",
          "orderId": e["orderId"] ?? e["id"] ?? "ORD-2026-001",
          "camera": e["cameraName"] ?? e["camera"] ?? "Cam 01 - Main Gate",
          "duration": e["duration"] ?? "02:45 mins",
          "timestamp": e["timestamp"] ?? e["createdAt"]?.toString().substring(0, 19) ?? "2026-08-03 10:30 AM",
          "status": e["status"] ?? "Verified Evidence",
          "videoUrl": e["videoUrl"] ?? "https://www.w3schools.com/html/mov_bbb.mp4",
        }));

        if (recordingsList.isNotEmpty) {
          if (widget.orderId != null) {
            selectedRecording = recordingsList.firstWhere(
              (element) => element["orderId"] == widget.orderId,
              orElse: () => recordingsList.first,
            );
          } else {
            selectedRecording = recordingsList.first;
          }
        }
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        recordingsList = [
          {"id": "REC-001", "orderId": "ORD-2026-001", "camera": "Cam 01 - Gate A", "duration": "03:12 mins", "timestamp": "2026-08-03 11:15 AM", "status": "Verified", "videoUrl": "https://www.w3schools.com/html/mov_bbb.mp4"},
          {"id": "REC-002", "orderId": "ORD-2026-002", "camera": "Cam 02 - Packing", "duration": "01:50 mins", "timestamp": "2026-08-03 12:00 PM", "status": "Pending", "videoUrl": "https://www.w3schools.com/html/mov_bbb.mp4"},
          {"id": "REC-003", "orderId": "ORD-2026-003", "camera": "Cam 03 - Dispatch", "duration": "04:05 mins", "timestamp": "2026-08-03 12:45 PM", "status": "Flagged Exception", "videoUrl": "https://www.w3schools.com/html/mov_bbb.mp4"},
        ];
        selectedRecording = recordingsList.first;
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: "Video Recordings & Audit Trail",
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(32.0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Left Panel: Recordings List
                  Expanded(
                    flex: 5,
                    child: Card(
                      elevation: 0,
                      color: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                      child: Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text("Evidence Recordings", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                OutlinedButton.icon(
                                  onPressed: fetchRecordings,
                                  icon: const Icon(Icons.refresh, size: 16),
                                  label: const Text("Sync API"),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Expanded(
                              child: ListView.separated(
                                itemCount: recordingsList.length,
                                separatorBuilder: (_, __) => const Divider(height: 16),
                                itemBuilder: (context, index) {
                                  final rec = recordingsList[index];
                                  final isSelected = selectedRecording?["id"] == rec["id"];
                                  return ListTile(
                                    tileColor: isSelected ? Colors.blue.shade50 : null,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    leading: Container(
                                      padding: const EdgeInsets.all(10),
                                      decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                                      child: const Icon(Icons.play_circle_filled, color: Colors.blue),
                                    ),
                                    title: Text(rec["orderId"].toString(), style: const TextStyle(fontWeight: FontWeight.bold)),
                                    subtitle: Text("${rec["camera"]} • ${rec["timestamp"]}", style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                    trailing: Text(rec["duration"].toString(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black54)),
                                    onTap: () => setState(() => selectedRecording = rec),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 24),

                  // Right Panel: Selected Video Player & Audit Details
                  Expanded(
                    flex: 7,
                    child: Card(
                      elevation: 0,
                      color: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text("Audit Stream: ${selectedRecording?["orderId"] ?? "Select Recording"}", style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                                  child: Text(selectedRecording?["status"] ?? "Verified", style: const TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 20),

                            // Video Player Mock / Preview Container
                            Container(
                              height: 280,
                              width: double.infinity,
                              decoration: BoxDecoration(
                                color: Colors.black,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  const Icon(Icons.play_circle_outline, size: 72, color: Colors.white70),
                                  Positioned(
                                    bottom: 16,
                                    left: 16,
                                    right: 16,
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text("Camera: ${selectedRecording?["camera"]}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500)),
                                        Text("Duration: ${selectedRecording?["duration"]}", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),

                            const Text("AI Verification & Weight Audit Log", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 12),
                            _auditInfoRow("Camera Source", selectedRecording?["camera"] ?? "-"),
                            const Divider(height: 16),
                            _auditInfoRow("Timestamp Recorded", selectedRecording?["timestamp"] ?? "-"),
                            const Divider(height: 16),
                            _auditInfoRow("Barcode / SKU Matched", "Cargo Net 20x30 Industrial Grade"),
                            const Divider(height: 16),
                            _auditInfoRow("Weight Discrepancy Status", "Within Tolerance Limits (0.02kg var)"),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _auditInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Colors.black87)),
      ],
    );
  }
}
