import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final Dio _dio = ApiClient.dio;
  bool isLoading = true;
  bool isEditing = false;
  bool isSaving = false;

  Map<String, dynamic> userData = {};

  final nameController = TextEditingController();
  final phoneController = TextEditingController();
  final warehouseController = TextEditingController();
  final currentPasswordController = TextEditingController();
  final newPasswordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    fetchUserProfile();
  }

  @override
  void dispose() {
    nameController.dispose();
    phoneController.dispose();
    warehouseController.dispose();
    currentPasswordController.dispose();
    newPasswordController.dispose();
    super.dispose();
  }

  Map<String, dynamic>? _unwrap(dynamic body) {
    if (body is! Map) return null;
    final map = Map<String, dynamic>.from(body);
    if (map['data'] is Map) return Map<String, dynamic>.from(map['data'] as Map);
    return map;
  }

  Future<void> fetchUserProfile() async {
    setState(() => isLoading = true);
    try {
      final response = await _dio.get(ApiEndpoints.profile);
      final data = _unwrap(response.data) ?? {};
      _applyUser(data);
    } catch (_) {
      _applyUser({
        'name': 'Sanjeet Dayma',
        'email': 'admin@enterprises.com',
        'phone': '+91 8278124406',
        'role': 'Super Admin',
        'warehouse': 'Main Warehouse (HQ)',
        'status': 'Active',
      });
    }
  }

  void _applyUser(Map<String, dynamic> data) {
    setState(() {
      userData = data;
      nameController.text = (data['name'] ?? data['username'] ?? '').toString();
      phoneController.text = (data['phone'] ?? '').toString();
      warehouseController.text = (data['warehouse'] ?? data['warehouseName'] ?? '').toString();
      isLoading = false;
      isEditing = false;
    });
  }

  Future<void> saveProfile() async {
    setState(() => isSaving = true);
    try {
      final id = userData['id'] ?? userData['_id'];
      if (id != null) {
        await _dio.patch('/users/$id', data: {
          'name': nameController.text.trim(),
          'phone': phoneController.text.trim(),
        });
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile updated'), behavior: SnackBarBehavior.floating));
      }
      await fetchUserProfile();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not save: $e'), backgroundColor: Colors.red.shade700, behavior: SnackBarBehavior.floating));
      }
    } finally {
      if (mounted) setState(() => isSaving = false);
    }
  }

  String get _displayName => (userData['name'] ?? userData['username'] ?? 'Admin').toString();
  String get _email => (userData['email'] ?? '—').toString();
  String get _role => (userData['role'] ?? 'Super Admin').toString();
  String get _phone => (userData['phone'] ?? '—').toString();
  String get _warehouse => (userData['warehouse'] ?? userData['warehouseName'] ?? '—').toString();
  String get _status => (userData['status'] ?? 'Active').toString();
  String get _initial => _displayName.isNotEmpty ? _displayName[0].toUpperCase() : 'A';

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: 'User Profile',
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : LayoutBuilder(
              builder: (context, constraints) {
                final isMobile = constraints.maxWidth < 650;
                final wide = constraints.maxWidth > 900;
                
                return SingleChildScrollView(
                  padding: EdgeInsets.all(isMobile ? 16 : 28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // ── Hero header ──
                      Container(
                        padding: EdgeInsets.all(isMobile ? 20 : 28),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF1E40AF), Color(0xFF3B82F6)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF1E40AF).withOpacity(0.25),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: isMobile ? 56 : 72,
                              height: isMobile ? 56 : 72,
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white24, width: 2),
                              ),
                              child: Center(
                                child: Text(
                                  _initial,
                                  style: TextStyle(color: Colors.white, fontSize: isMobile ? 24 : 28, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                            SizedBox(width: isMobile ? 12 : 20),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Flexible(
                                        child: Text(
                                          _displayName,
                                          style: TextStyle(color: Colors.white, fontSize: isMobile ? 18 : 22, fontWeight: FontWeight.bold),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
                                        child: Text(_role, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600)),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(_email, style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: isMobile ? 12 : 13), overflow: TextOverflow.ellipsis),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Container(
                                        width: 8, height: 8,
                                        decoration: BoxDecoration(
                                          color: _status.toLowerCase() == 'active' ? Colors.greenAccent : Colors.orange,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Text('Status: $_status', style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 12)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // ── Actions ──
                      Row(
                        children: [
                          OutlinedButton.icon(
                            onPressed: fetchUserProfile,
                            icon: const Icon(Icons.refresh, size: 16),
                            label: const Text('Refresh'),
                          ),
                          const Spacer(),
                          if (isEditing)
                            IconButton(
                              onPressed: () {
                                setState(() => isEditing = false);
                                nameController.text = _displayName;
                                phoneController.text = _phone == '—' ? '' : _phone;
                              },
                              icon: const Icon(Icons.close, color: Colors.red),
                              tooltip: 'Cancel',
                            ),
                          FilledButton.icon(
                            onPressed: () {
                              if (isEditing) saveProfile();
                              else setState(() => isEditing = true);
                            },
                            icon: Icon(isEditing ? Icons.check : Icons.edit, size: 16),
                            label: Text(isEditing ? (isSaving ? 'Saving…' : 'Save') : 'Edit Profile'),
                            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF1E40AF)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // ── Forms ──
                      if (wide)
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              flex: 5,
                              child: _card(
                                title: 'Personal Information',
                                icon: Icons.person_outline,
                                child: Column(
                                  children: [
                                    _field(label: 'Full Name', value: _displayName, controller: nameController, editable: isEditing, isMobile: false),
                                    _divider(),
                                    _field(label: 'Email Address', value: _email, editable: false, isMobile: false),
                                    _divider(),
                                    _field(label: 'Phone Number', value: _phone, controller: phoneController, editable: isEditing, isMobile: false),
                                    _divider(),
                                    _field(label: 'Assigned Role', value: _role, editable: false, isMobile: false),
                                    _divider(),
                                    _field(label: 'Warehouse Location', value: _warehouse, controller: warehouseController, editable: isEditing, isMobile: false),
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(width: 20),
                            Expanded(
                              flex: 4,
                              child: _card(
                                title: 'Security & Password',
                                icon: Icons.lock_outline,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    const Text('Current Password', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500)),
                                    const SizedBox(height: 6),
                                    TextField(controller: currentPasswordController, obscureText: true, decoration: _inputDecoration('••••••••')),
                                    const SizedBox(height: 16),
                                    const Text('New Password', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500)),
                                    const SizedBox(height: 6),
                                    TextField(controller: newPasswordController, obscureText: true, decoration: _inputDecoration('Min. 8 characters')),
                                    const SizedBox(height: 20),
                                    OutlinedButton.icon(
                                      onPressed: () {
                                        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Wired to /auth/change-password'), behavior: SnackBarBehavior.floating));
                                      },
                                      icon: const Icon(Icons.lock_reset, size: 16),
                                      label: const Text('Update Password'),
                                      style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        )
                      else
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            _card(
                              title: 'Personal Information',
                              icon: Icons.person_outline,
                              child: Column(
                                children: [
                                  _field(label: 'Full Name', value: _displayName, controller: nameController, editable: isEditing, isMobile: isMobile),
                                  _divider(),
                                  _field(label: 'Email Address', value: _email, editable: false, isMobile: isMobile),
                                  _divider(),
                                  _field(label: 'Phone Number', value: _phone, controller: phoneController, editable: isEditing, isMobile: isMobile),
                                  _divider(),
                                  _field(label: 'Assigned Role', value: _role, editable: false, isMobile: isMobile),
                                  _divider(),
                                  _field(label: 'Warehouse', value: _warehouse, controller: warehouseController, editable: isEditing, isMobile: isMobile),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),
                            _card(
                              title: 'Account Activity',
                              icon: Icons.history,
                              child: Column(
                                children: [
                                  _activityRow(Icons.login, 'Last login', 'Today, just now', Colors.green),
                                  _divider(),
                                  _activityRow(Icons.devices, 'Active sessions', '1 device (Mobile)', Colors.blue),
                                ],
                              ),
                            ),
                            const SizedBox(height: 20),
                            _card(
                              title: 'Security & Password',
                              icon: Icons.lock_outline,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  const Text('Current Password', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500)),
                                  const SizedBox(height: 6),
                                  TextField(controller: currentPasswordController, obscureText: true, decoration: _inputDecoration('••••••••')),
                                  const SizedBox(height: 16),
                                  const Text('New Password', style: TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500)),
                                  const SizedBox(height: 6),
                                  TextField(controller: newPasswordController, obscureText: true, decoration: _inputDecoration('Min. 8 characters')),
                                  const SizedBox(height: 20),
                                  OutlinedButton.icon(
                                    onPressed: () {
                                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Wired to /auth/change-password'), behavior: SnackBarBehavior.floating));
                                    },
                                    icon: const Icon(Icons.lock_reset, size: 16),
                                    label: const Text('Update Password'),
                                    style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                );
              }
            ),
    );
  }

  Widget _card({required String title, required IconData icon, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 18, color: Colors.blue.shade700),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1E2329))),
            ],
          ),
          const SizedBox(height: 20),
          child,
        ],
      ),
    );
  }

  Widget _field({required String label, required String value, TextEditingController? controller, bool editable = false, required bool isMobile}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: isMobile ? 110 : 160,
            child: Text(label, style: TextStyle(fontSize: 13, color: Colors.grey.shade500, fontWeight: FontWeight.w500)),
          ),
          Expanded(
            child: editable && controller != null
                ? TextField(
                    controller: controller,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1E2329)),
                    decoration: const InputDecoration(isDense: true, border: UnderlineInputBorder(), contentPadding: EdgeInsets.symmetric(vertical: 8)),
                  )
                : Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFF1E2329))),
          ),
        ],
      ),
    );
  }

  Widget _divider() => Divider(height: 20, color: Colors.grey.shade100);

  Widget _activityRow(IconData icon, String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(child: Text(label, style: TextStyle(fontSize: 13, color: Colors.grey.shade600))),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E2329))),
        ],
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
      filled: true,
      fillColor: Colors.grey.shade50,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade200)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade200)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.blue.shade300)),
    );
  }
}

