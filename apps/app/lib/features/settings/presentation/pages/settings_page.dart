import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final Dio _dio = ApiClient.dio;

  int selectedTabIndex = 0;
  bool isLoading = true;
  String? errorMessage;

  // Live data
  int warehouseCount = 0;
  int activeWarehouseCount = 0;
  int userCount = 0;
  String companyName = '—';
  String companyEmail = '—';
  String companyPhone = '—';
  List<Map<String, dynamic>> warehouses = [];

  // Local toggles (no settings API yet)
  bool maintenanceMode = false;
  bool enableBarcodeScanning = true;
  bool enableVideoRecording = true;
  bool autoVerifyOrders = true;
  bool emailNotifications = true;
  bool dataSync = true;

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

  final TextEditingController _companyNameCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    fetchSettingsData();
  }

  @override
  void dispose() {
    _companyNameCtrl.dispose();
    super.dispose();
  }

  List<dynamic> _extractItems(dynamic body) {
    if (body is List) return body;
    if (body is! Map) return [];
    final map = Map<String, dynamic>.from(body);
    final data = map['data'];
    if (data is List) return data;
    if (data is Map) {
      final inner = Map<String, dynamic>.from(data);
      if (inner['items'] is List) return inner['items'] as List;
      if (inner['data'] is List) return inner['data'] as List;
    }
    if (map['items'] is List) return map['items'] as List;
    return [];
  }

  Map<String, dynamic>? _unwrap(dynamic body) {
    if (body is! Map) return null;
    final map = Map<String, dynamic>.from(body);
    if (map['data'] is Map) return Map<String, dynamic>.from(map['data'] as Map);
    return map;
  }

  Future<void> fetchSettingsData() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final results = await Future.wait([
        _dio.get(ApiEndpoints.warehouses).catchError((_) => null),
        _dio.get(ApiEndpoints.users).catchError((_) => null),
        _dio.get(ApiEndpoints.companies).catchError((_) => null),
        _dio.get(ApiEndpoints.profile).catchError((_) => null),
      ]);

      // Warehouses
      final whRes = results[0];
      if (whRes != null) {
        final items = _extractItems(whRes.data);
        warehouses = items.map<Map<String, dynamic>>((e) {
          final m = Map<String, dynamic>.from(e as Map);
          return {
            'id': (m['id'] ?? '—').toString(),
            'name': (m['name'] ?? m['warehouseName'] ?? 'Warehouse').toString(),
            'code': (m['code'] ?? m['warehouseCode'] ?? '—').toString(),
            'city': (m['city'] ?? m['address']?['city'] ?? m['location'] ?? '—').toString(),
            'status': (m['status'] ?? m['isActive'] == true ? 'Active' : (m['isActive'] == false ? 'Inactive' : 'Active')).toString(),
          };
        }).toList();
        warehouseCount = warehouses.length;
        activeWarehouseCount = warehouses.where((w) {
          final s = (w['status'] ?? '').toString().toLowerCase();
          return s == 'active' || s == 'true';
        }).length;
        if (activeWarehouseCount == 0 && warehouseCount > 0) activeWarehouseCount = warehouseCount;
      }

      // Users
      final usersRes = results[1];
      if (usersRes != null) {
        final items = _extractItems(usersRes.data);
        userCount = items.length;
      }

      // Company
      final companyRes = results[2];
      if (companyRes != null) {
        final items = _extractItems(companyRes.data);
        if (items.isNotEmpty) {
          final c = Map<String, dynamic>.from(items.first as Map);
          companyName = (c['name'] ?? c['companyName'] ?? '—').toString();
          companyEmail = (c['email'] ?? c['contactEmail'] ?? '—').toString();
          companyPhone = (c['phone'] ?? c['contactPhone'] ?? '—').toString();
        } else {
          final data = _unwrap(companyRes.data);
          if (data != null) {
            companyName = (data['name'] ?? data['companyName'] ?? companyName).toString();
            companyEmail = (data['email'] ?? companyEmail).toString();
            companyPhone = (data['phone'] ?? companyPhone).toString();
          }
        }
      }

      // Profile fallback for company name
      final profileRes = results[3];
      if (profileRes != null && (companyName == '—' || companyName.isEmpty)) {
        final p = _unwrap(profileRes.data);
        if (p != null) {
          companyName = (p['companyName'] ?? p['company']?['name'] ?? companyName).toString();
        }
      }

      _companyNameCtrl.text = companyName == '—' ? '' : companyName;

      setState(() => isLoading = false);
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = e is DioException
            ? (e.response?.data is Map
                ? (e.response!.data['message']?.toString() ?? e.message)
                : e.message)
            : e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: "Settings",
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : LayoutBuilder(
              builder: (context, constraints) {
                final isMobile = constraints.maxWidth < 800;
                final isWide = constraints.maxWidth > 1200;

                return SingleChildScrollView(
                  padding: EdgeInsets.all(isMobile ? 16.0 : 32.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (errorMessage != null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.orange.shade50,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.orange.shade200),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.warning_amber, color: Colors.orange.shade700, size: 20),
                              const SizedBox(width: 8),
                              Expanded(child: Text(errorMessage!, style: TextStyle(color: Colors.orange.shade900, fontSize: 13))),
                              TextButton(onPressed: fetchSettingsData, child: const Text("Retry")),
                            ],
                          ),
                        ),

                      // Top metric cards — LIVE
                      Wrap(
                        spacing: 16,
                        runSpacing: 16,
                        children: [
                          SizedBox(
                            width: isWide ? (constraints.maxWidth - 64) / 4 : (isMobile ? double.infinity : (constraints.maxWidth - 48) / 2),
                            child: _buildTopCard(
                              "Total Warehouses",
                              warehouseCount.toString(),
                              "Active: $activeWarehouseCount",
                              Icons.warehouse_outlined,
                              Colors.blue,
                            ),
                          ),
                          SizedBox(
                            width: isWide ? (constraints.maxWidth - 64) / 4 : (isMobile ? double.infinity : (constraints.maxWidth - 48) / 2),
                            child: _buildTopCard(
                              "Total Users",
                              userCount.toString(),
                              "From Users API",
                              Icons.people_outline,
                              Colors.indigo,
                            ),
                          ),
                          SizedBox(
                            width: isWide ? (constraints.maxWidth - 64) / 4 : (isMobile ? double.infinity : (constraints.maxWidth - 48) / 2),
                            child: _buildTopCard(
                              "Company",
                              companyName.length > 18 ? '${companyName.substring(0, 16)}…' : companyName,
                              "Live profile",
                              Icons.business_outlined,
                              Colors.teal,
                            ),
                          ),
                          SizedBox(
                            width: isWide ? (constraints.maxWidth - 64) / 4 : (isMobile ? double.infinity : (constraints.maxWidth - 48) / 2),
                            child: _buildTopCard(
                              "Data Sync",
                              dataSync ? "On" : "Off",
                              "Local toggle",
                              Icons.sync,
                              Colors.green,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Tabs + form
                      if (isMobile) ...[
                        SizedBox(
                          height: 48,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            itemCount: settingTabs.length,
                            itemBuilder: (_, i) {
                              final tab = settingTabs[i];
                              final selected = selectedTabIndex == i;
                              return Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: ChoiceChip(
                                  label: Text(tab["label"], style: const TextStyle(fontSize: 12)),
                                  selected: selected,
                                  onSelected: (_) => setState(() => selectedTabIndex = i),
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildFormArea(isMobile),
                      ] else
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SizedBox(
                              width: 220,
                              child: Card(
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  side: BorderSide(color: Colors.grey.shade200),
                                ),
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
                                            border: Border(
                                              left: BorderSide(
                                                color: isSelected ? Colors.blue.shade700 : Colors.transparent,
                                                width: 4,
                                              ),
                                            ),
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
                            Expanded(child: _buildFormArea(isMobile)),
                          ],
                        ),
                    ],
                  ),
                );
              },
            ),
    );
  }

  Widget _buildFormArea(bool isMobile) {
    final tab = settingTabs[selectedTabIndex]["label"] as String;

    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: EdgeInsets.all(isMobile ? 16.0 : 32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("$tab Settings", style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                IconButton(
                  onPressed: fetchSettingsData,
                  icon: const Icon(Icons.refresh),
                  tooltip: "Refresh from API",
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text("Live data from backend APIs", style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
            const SizedBox(height: 24),

            if (tab == "Company Profile" || tab == "General") ...[
              const Text("Company Name", style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 8),
              TextField(
                controller: _companyNameCtrl,
                readOnly: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  helperText: "Loaded from /companies API",
                ),
              ),
              const SizedBox(height: 16),
              _infoRow("Email", companyEmail),
              _infoRow("Phone", companyPhone),
              const SizedBox(height: 20),
              if (isMobile)
                Column(children: [_buildTimezoneField(), const SizedBox(height: 16), _buildCurrencyField()])
              else
                Row(children: [Expanded(child: _buildTimezoneField()), const SizedBox(width: 20), Expanded(child: _buildCurrencyField())]),
            ],

            if (tab == "Warehouses") ...[
              if (warehouses.isEmpty)
                Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    children: [
                      Icon(Icons.warehouse_outlined, size: 48, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      Text("No warehouses found", style: TextStyle(color: Colors.grey.shade600)),
                      const SizedBox(height: 4),
                      Text("Create warehouses from backend or seed data.", style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                    ],
                  ),
                )
              else
                ...warehouses.map((w) => Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: BorderSide(color: Colors.grey.shade200)),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Colors.blue.shade50,
                          child: Icon(Icons.warehouse, color: Colors.blue.shade700, size: 20),
                        ),
                        title: Text(w['name'] ?? '—', style: const TextStyle(fontWeight: FontWeight.w600)),
                        subtitle: Text("${w['code']} • ${w['city']}"),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.green.shade50,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(w['status'] ?? 'Active', style: TextStyle(color: Colors.green.shade700, fontSize: 12, fontWeight: FontWeight.w600)),
                        ),
                      ),
                    )),
            ],

            if (tab == "Users & Roles") ...[
              _infoRow("Total Users", userCount.toString()),
              const SizedBox(height: 12),
              Text("Manage users from the Users page in the sidebar.", style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
            ],

            if (tab == "Scanning Settings" || tab == "Recording Settings" || tab == "Order Settings" || tab == "Alerts") ...[
              _toggleRow("Enable Barcode Scanning", enableBarcodeScanning, (v) => setState(() => enableBarcodeScanning = v)),
              _toggleRow("Enable Video Recording", enableVideoRecording, (v) => setState(() => enableVideoRecording = v)),
              _toggleRow("Auto Verify Orders", autoVerifyOrders, (v) => setState(() => autoVerifyOrders = v)),
              _toggleRow("Email Notifications", emailNotifications, (v) => setState(() => emailNotifications = v)),
              _toggleRow("Data Sync", dataSync, (v) => setState(() => dataSync = v)),
              _toggleRow("Maintenance Mode", maintenanceMode, (v) => setState(() => maintenanceMode = v)),
              const SizedBox(height: 12),
              Text("Toggles are local for now — settings API can be added later.", style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
            ],

            if (tab == "Storage" || tab == "Security") ...[
              _infoRow("Storage", "Configured via backend (Backblaze B2 / S3)"),
              _infoRow("Security", "JWT + Role guards active on all APIs"),
              const SizedBox(height: 8),
              Text("Production storage & SSL are set during deployment.", style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
          Flexible(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13), textAlign: TextAlign.right)),
        ],
      ),
    );
  }

  Widget _toggleRow(String label, bool value, ValueChanged<bool> onChanged) {
    return SwitchListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(label, style: const TextStyle(fontSize: 14)),
      value: value,
      onChanged: onChanged,
    );
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
          onChanged: (_) {},
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
          onChanged: (_) {},
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
            Text(sub, style: TextStyle(color: Colors.grey.shade600, fontSize: 11, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}
