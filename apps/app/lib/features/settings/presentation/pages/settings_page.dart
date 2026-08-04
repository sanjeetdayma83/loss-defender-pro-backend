import 'package:flutter/material.dart';
import '../../../../shared/layout/app_layout.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  int selectedTabIndex = 0;
  bool maintenanceMode = false;

  final List<Map<String, dynamic>> settingTabs = [
    {"label": "General", "icon": Icons.settings_outlined},
    {"label": "Company Profile", "icon": Icons.business_outlined},
    {"label": "Warehouses", "icon": Icons.warehouse_outlined},
    {"label": "Users & Roles", "icon": Icons.group_outlined},
    {"label": "Order Settings", "icon": Icons.shopping_bag_outlined},
    {"label": "Scanning Settings", "icon": Icons.qr_code_scanner_outlined},
    {"label": "Recording Settings", "icon": Icons.videocam_outlined},
    {"label": "Alerts", "icon": Icons.notifications_outlined},
    {"label": "Storage", "icon": Icons.storage_outlined},
    {"label": "Security", "icon": Icons.security_outlined},
  ];

  bool enableBarcodeScanning = true;
  bool enableVideoRecording = true;
  bool autoVerifyOrders = true;
  bool emailNotifications = true;
  bool dataSync = true;

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: "Settings",
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isMobile = constraints.maxWidth < 800;
          final isWide = constraints.maxWidth > 1200;

          return SingleChildScrollView(
            padding: EdgeInsets.all(isMobile ? 16.0 : 32.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Cards Grid
                Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  children: [
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 4 : (isMobile ? double.infinity : (constraints.maxWidth - 48) / 2), child: _buildTopCard("Total Warehouses", "8", "Active: 8", Icons.warehouse_outlined, Colors.blue)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 4 : (isMobile ? double.infinity : (constraints.maxWidth - 48) / 2), child: _buildStorageCard("System Storage", "248.5 GB", "Used of 1 TB (24.8%)")),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 4 : (isMobile ? double.infinity : (constraints.maxWidth - 48) / 2), child: _buildTopCard("System Uptime", "99.8%", "Last 7 days", Icons.monitor_heart_outlined, Colors.green)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 4 : (isMobile ? double.infinity : (constraints.maxWidth - 48) / 2), child: _buildActionCard("System Logs", "12,548", "View all logs", Icons.description_outlined, Colors.orange)),
                  ],
                ),
                const SizedBox(height: 32),

                if (isMobile) ...[
                  // Mobile Dropdown for tabs
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<int>(
                        value: selectedTabIndex,
                        isExpanded: true,
                        items: List.generate(settingTabs.length, (index) {
                          return DropdownMenuItem(
                            value: index,
                            child: Text(settingTabs[index]["label"], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          );
                        }),
                        onChanged: (val) {
                          if (val != null) setState(() => selectedTabIndex = val);
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Form Area (Mobile Stack)
                  _buildFormArea(isMobile),
                ] else ...[
                  // Desktop Row Layout
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: 260,
                        child: Card(
                          elevation: 0,
                          color: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 12.0),
                            child: Column(
                              children: List.generate(settingTabs.length, (index) {
                                final tab = settingTabs[index];
                                final isSelected = selectedTabIndex == index;
                                return InkWell(
                                  onTap: () => setState(() => selectedTabIndex = index),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                    decoration: BoxDecoration(
                                      color: isSelected ? Colors.blue.shade50 : Colors.transparent,
                                      border: Border(left: BorderSide(color: isSelected ? Colors.blue.shade700 : Colors.transparent, width: 4)),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(tab["icon"], size: 18, color: isSelected ? Colors.blue.shade700 : Colors.grey.shade600),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: Text(
                                            tab["label"],
                                            style: TextStyle(
                                              color: isSelected ? Colors.blue.shade700 : Colors.black87,
                                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                              fontSize: 13,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              }),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 24),
                      Expanded(
                        child: _buildFormArea(isMobile),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildFormArea(bool isMobile) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: EdgeInsets.all(isMobile ? 16.0 : 32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(settingTabs[selectedTabIndex]["label"] + " Settings", style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            const Text("Company Name", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 8),
            TextField(
              controller: TextEditingController(text: "Loss Defender Enterprises"),
              decoration: InputDecoration(border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)), contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14)),
            ),
            const SizedBox(height: 20),
            if (isMobile)
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildTimezoneField(),
                  const SizedBox(height: 16),
                  _buildCurrencyField(),
                ],
              )
            else
              Row(
                children: [
                  Expanded(child: _buildTimezoneField()),
                  const SizedBox(width: 20),
                  Expanded(child: _buildCurrencyField()),
                ],
              ),
            const SizedBox(height: 24),
            const Text("Company Logo", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
              ),
              child: Column(
                children: [
                  Icon(Icons.shield_outlined, size: 48, color: Colors.blue.shade700),
                  const SizedBox(height: 12),
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      text: "Click to upload ",
                      style: TextStyle(color: Colors.blue.shade700, fontWeight: FontWeight.bold),
                      children: const [
                        TextSpan(text: "or drag and drop", style: TextStyle(color: Colors.grey, fontWeight: FontWeight.normal)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text("PNG, JPG or SVG (max. 2MB)", style: TextStyle(color: Colors.grey, fontSize: 11)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text("System Preferences", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            _buildCheckboxTile("Enable Barcode / QR Code Scanning", "Allow scanning across the system", enableBarcodeScanning, (val) => setState(() => enableBarcodeScanning = val!)),
            _buildCheckboxTile("Enable Video Recording", "Record videos during picking and packing", enableVideoRecording, (val) => setState(() => enableVideoRecording = val!)),
            _buildCheckboxTile("Auto Verify Orders", "Automatically verify orders after scan completion", autoVerifyOrders, (val) => setState(() => autoVerifyOrders = val!)),
            _buildCheckboxTile("Email Notifications", "Send email alerts for important events", emailNotifications, (val) => setState(() => emailNotifications = val!)),
            _buildCheckboxTile("Data Sync (Background)", "Sync data in the background automatically", dataSync, (val) => setState(() => dataSync = val!)),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
              child: Row(
                children: [
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("System Maintenance Mode", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        SizedBox(height: 2),
                        Text("Enable maintenance mode to prevent access for non-admin users.", style: TextStyle(color: Colors.grey, fontSize: 12)),
                      ],
                    ),
                  ),
                  Switch(value: maintenanceMode, onChanged: (val) => setState(() => maintenanceMode = val)),
                ],
              ),
            ),
            const SizedBox(height: 32),
            if (isMobile)
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.refresh, size: 16),
                    label: const Text("Reset to Defaults"),
                    style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                  ),
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: () => _showSaved(),
                    icon: const Icon(Icons.save, size: 16),
                    label: const Text("Save Changes"),
                    style: FilledButton.styleFrom(backgroundColor: Colors.blue.shade700, padding: const EdgeInsets.symmetric(vertical: 14)),
                  ),
                ],
              )
            else
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.refresh, size: 16),
                    label: const Text("Reset to Defaults"),
                    style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14)),
                  ),
                  const SizedBox(width: 12),
                  FilledButton.icon(
                    onPressed: () => _showSaved(),
                    icon: const Icon(Icons.save, size: 16),
                    label: const Text("Save Changes"),
                    style: FilledButton.styleFrom(backgroundColor: Colors.blue.shade700, padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14)),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  void _showSaved() {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Settings saved successfully!"), backgroundColor: Colors.green, behavior: SnackBarBehavior.floating));
  }

  Widget _buildTimezoneField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Timezone", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: "(GMT +05:30) Asia/Kolkata",
          items: const [DropdownMenuItem(value: "(GMT +05:30) Asia/Kolkata", child: Text("(GMT +05:30) Asia/Kolkata", style: TextStyle(fontSize: 13)))],
          onChanged: (val) {},
          decoration: InputDecoration(border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)), contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14)),
        ),
      ],
    );
  }

  Widget _buildCurrencyField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Currency", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: "INR (₹) - Indian Rupee",
          items: const [DropdownMenuItem(value: "INR (₹) - Indian Rupee", child: Text("INR (₹) - Indian Rupee", style: TextStyle(fontSize: 13)))],
          onChanged: (val) {},
          decoration: InputDecoration(border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)), contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14)),
        ),
      ],
    );
  }

  Widget _buildTopCard(String title, String value, String sub, IconData icon, Color color) {
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
            Text(sub, style: const TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.w500)),
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
                  decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(8)),
                  child: Icon(Icons.storage, color: Colors.blue.shade700, size: 20),
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

  Widget _buildActionCard(String title, String value, String actionText, IconData icon, Color color) {
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
            const SizedBox(height: 6),
            InkWell(
              onTap: () {},
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(actionText, style: TextStyle(color: Colors.blue.shade700, fontSize: 11, fontWeight: FontWeight.bold)),
                  const SizedBox(width: 4),
                  Icon(Icons.arrow_forward, size: 12, color: Colors.blue.shade700),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckboxTile(String title, String subtitle, bool value, ValueChanged<bool?> onChanged) {
    return CheckboxListTile(
      value: value,
      onChanged: onChanged,
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
      subtitle: Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 11)),
      controlAffinity: ListTileControlAffinity.leading,
      contentPadding: EdgeInsets.zero,
      dense: true,
    );
  }
}
