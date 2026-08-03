import 'package:flutter/material.dart';
import '../../../../shared/layout/app_layout.dart';

class RecordingPage extends StatefulWidget {
  final String orderId;
  const RecordingPage({super.key, this.orderId = 'ORD-202600516-001'});

  @override
  State<RecordingPage> createState() => _RecordingPageState();
}

class _RecordingPageState extends State<RecordingPage> {
  bool isPlaying = true;
  double progressVal = 0.35;
  int selectedTimelineIndex = 2;

  final List<Map<String, dynamic>> timelineClips = [
    {"time": "00:00", "active": false},
    {"time": "00:45", "active": false},
    {"time": "01:32", "active": true},
    {"time": "02:18", "active": false},
    {"time": "03:04", "active": false},
    {"time": "04:10", "active": false},
    {"time": "05:12", "active": false},
  ];

  final List<Map<String, dynamic>> allRecordings = [
    {"orderId": "ORD-202600516-001", "customer": "Rahul Enterprises", "warehouse": "Main Warehouse", "recordedBy": "Admin", "date": "16 May 2026, 10:32 AM", "duration": "05:12", "size": "125.6 MB", "status": "Verified"},
    {"orderId": "ORD-202600516-002", "customer": "Sharma Traders", "warehouse": "Main Warehouse", "recordedBy": "Vikram Singh", "date": "16 May 2026, 10:28 AM", "duration": "03:47", "size": "98.3 MB", "status": "Pending"},
    {"orderId": "ORD-202600516-003", "customer": "Kiran Stores", "warehouse": "Secondary Warehouse", "recordedBy": "Amit Kumar", "date": "16 May 2026, 10:24 AM", "duration": "06:09", "size": "142.7 MB", "status": "Flagged"},
  ];

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: "Recordings & Evidence",
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top 5 Metric Cards
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth > 1200;
                return Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  children: [
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Total Recordings", "1,248", "+18.6% vs last week", Icons.videocam_outlined, Colors.blue)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStorageCard("Total Storage Used", "248.5 GB", "of 1 TB (24.8%)")),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Evidence Verified", "1,136", "+15.4% vs last week", Icons.verified_outlined, Colors.green)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Flagged Recordings", "112", "+6.3% vs last week", Icons.warning_amber_rounded, Colors.orange)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Avg. Duration", "04:32", "minutes", Icons.timer_outlined, Colors.purple)),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),

            // Middle Section: Video Player & Recording Details Panel
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth > 1050;
                return Flex(
                  direction: isWide ? Axis.horizontal : Axis.vertical,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 7,
                      child: _buildVideoPlayerSection(),
                    ),
                    if (isWide) const SizedBox(width: 24) else const SizedBox(height: 24),
                    Expanded(
                      flex: 5,
                      child: _buildRecordingDetailsCard(),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),

            // Recording Timeline
            _buildTimelineSection(),
            const SizedBox(height: 24),

            // All Recordings Table
            _buildAllRecordingsTable(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, String sub, IconData icon, Color color) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w500)),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                  child: Icon(icon, color: color, size: 20),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(sub, style: TextStyle(color: sub.contains("+") ? Colors.green : Colors.grey, fontSize: 11, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _buildStorageCard(String title, String value, String sub) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w500)),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: Colors.purple.shade50, borderRadius: BorderRadius.circular(8)),
                  child: Icon(Icons.storage, color: Colors.purple.shade700, size: 20),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(value: 0.248, backgroundColor: Colors.grey.shade100, color: Colors.blue, minHeight: 6),
            ),
            const SizedBox(height: 4),
            Text(sub, style: const TextStyle(color: Colors.grey, fontSize: 10)),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoPlayerSection() {
    return Card(
      elevation: 0,
      color: Colors.black,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: SizedBox(
        height: 380,
        child: Stack(
          alignment: Alignment.center,
          children: [
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1E2329), Color(0xFF0A1128)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.videocam, color: Colors.white.withValues(alpha: 0.2), size: 64),
                    const SizedBox(height: 8),
                    Text("LIVE FEED - WAREHOUSE CAM 01", style: TextStyle(color: Colors.white.withValues(alpha: 0.4), letterSpacing: 2, fontSize: 12)),
                  ],
                ),
              ),
            ),
            Positioned(
              top: 16,
              left: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(4)),
                child: Row(
                  children: [
                    Container(width: 6, height: 6, decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle)),
                    const SizedBox(width: 6),
                    const Text("REC", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
                  ],
                ),
              ),
            ),
            Positioned(
              top: 16,
              right: 16,
              child: Text("16 May 2026, 10:32 AM", style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12, fontWeight: FontWeight.bold)),
            ),
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.transparent, Colors.black.withValues(alpha: 0.8)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: Column(
                  children: [
                    SliderTheme(
                      data: SliderThemeData(trackHeight: 3, thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6)),
                      child: Slider(
                        value: progressVal,
                        onChanged: (val) => setState(() => progressVal = val),
                        activeColor: Colors.blueAccent,
                        inactiveColor: Colors.white30,
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            IconButton(
                              icon: Icon(isPlaying ? Icons.pause : Icons.play_arrow, color: Colors.white, size: 20),
                              onPressed: () => setState(() => isPlaying = !isPlaying),
                            ),
                            const SizedBox(width: 8),
                            const Text("00:04 / 05:12", style: TextStyle(color: Colors.white, fontSize: 12)),
                          ],
                        ),
                        Row(
                          children: [
                            IconButton(icon: const Icon(Icons.volume_up, color: Colors.white, size: 20), onPressed: () {}),
                            IconButton(icon: const Icon(Icons.settings, color: Colors.white, size: 20), onPressed: () {}),
                            IconButton(icon: const Icon(Icons.fullscreen, color: Colors.white, size: 20), onPressed: () {}),
                          ],
                        )
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecordingDetailsCard() {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text("Recording Details", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            _detailRow("Order ID", widget.orderId, isBold: true),
            const Divider(height: 20),
            _detailRow("Customer", "Rahul Enterprises"),
            const Divider(height: 20),
            _detailRow("Item", "Wireless Headphones"),
            const Divider(height: 20),
            _detailRow("Warehouse", "Main Warehouse"),
            const Divider(height: 20),
            _detailRow("Recorded By", "Admin"),
            const Divider(height: 20),
            _detailRow("Recording Time", "16 May 2026, 10:32 AM"),
            const Divider(height: 20),
            _detailRow("Duration", "05:12"),
            const Divider(height: 20),
            _detailRow("File Size", "125.6 MB"),
            const Divider(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Status", style: TextStyle(color: Colors.grey, fontSize: 13)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                  child: const Text("Verified", style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.download, size: 16),
                    label: const Text("Download"),
                    style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 12)),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.share, size: 16),
                    label: const Text("Share"),
                    style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 12)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {},
                style: FilledButton.styleFrom(backgroundColor: Colors.blue.shade700, padding: const EdgeInsets.symmetric(vertical: 12)),
                child: const Text("View Full Screen"),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value, {bool isBold = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
        Text(value, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.w500, fontSize: 13, color: Colors.black87)),
      ],
    );
  }

  Widget _buildTimelineSection() {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("Recording Timeline", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                TextButton(onPressed: () {}, child: const Text("Show All Clips (12)")),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 90,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: timelineClips.length,
                separatorBuilder: (context, index) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final clip = timelineClips[index];
                  final isSelected = selectedTimelineIndex == index;
                  return GestureDetector(
                    onTap: () => setState(() => selectedTimelineIndex = index),
                    child: Container(
                      width: 140,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade900,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: isSelected ? Colors.blue : Colors.transparent, width: 2),
                      ),
                      child: Stack(
                        alignment: Alignment.bottomCenter,
                        children: [
                          Center(
                            child: Icon(Icons.play_circle_outline, color: Colors.white.withValues(alpha: 0.7), size: 28),
                          ),
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            decoration: const BoxDecoration(
                              color: Colors.black54,
                              borderRadius: BorderRadius.vertical(bottom: Radius.circular(6)),
                            ),
                            child: Text(
                              clip["time"].toString(),
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAllRecordingsTable() {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("All Recordings", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Row(
                  children: [
                    OutlinedButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.filter_list, size: 16),
                      label: const Text("Filter"),
                      style: OutlinedButton.styleFrom(side: BorderSide(color: Colors.grey.shade300)),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300), borderRadius: BorderRadius.circular(8)),
                      child: const Row(
                        children: [
                          Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                          SizedBox(width: 8),
                          Text("16 May 2026 - 16 May 2026", style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                          SizedBox(width: 8),
                          Icon(Icons.arrow_drop_down, size: 16),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                headingRowColor: WidgetStateProperty.all(Colors.grey.shade50),
                columns: const [
                  DataColumn(label: Text("Thumbnail", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Order ID", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Customer", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Warehouse", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Recorded By", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Date & Time", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Duration", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Size", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Status", style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text("Actions", style: TextStyle(fontWeight: FontWeight.bold))),
                ],
                rows: allRecordings.map((rec) {
                  final status = rec["status"].toString();
                  Color statusColor = Colors.blue;
                  if (status == "Verified") statusColor = Colors.green;
                  if (status == "Pending") statusColor = Colors.orange;
                  if (status == "Flagged") statusColor = Colors.red;

                  return DataRow(
                    cells: [
                      DataCell(
                        Container(
                          width: 60,
                          height: 36,
                          decoration: BoxDecoration(color: Colors.black87, borderRadius: BorderRadius.circular(4)),
                          child: const Icon(Icons.play_arrow, color: Colors.white, size: 18),
                        ),
                      ),
                      DataCell(Text(rec["orderId"].toString(), style: const TextStyle(fontWeight: FontWeight.w600))),
                      DataCell(Text(rec["customer"].toString())),
                      DataCell(Text(rec["warehouse"].toString())),
                      DataCell(Text(rec["recordedBy"].toString())),
                      DataCell(Text(rec["date"].toString(), style: const TextStyle(color: Colors.grey))),
                      DataCell(Text(rec["duration"].toString())),
                      DataCell(Text(rec["size"].toString())),
                      DataCell(
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                          child: Text(status, style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      DataCell(
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(icon: const Icon(Icons.visibility, size: 18, color: Colors.blue), onPressed: () {}),
                            IconButton(icon: const Icon(Icons.download, size: 18, color: Colors.grey), onPressed: () {}),
                            IconButton(icon: const Icon(Icons.more_vert, size: 18, color: Colors.grey), onPressed: () {}),
                          ],
                        ),
                      ),
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
}
