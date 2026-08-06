import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import '../../../core/network/api_client.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_dialogs.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;
  bool _loading = true;
  String? _error;

  String? _userId;
  String? _name;
  String? _email;
  String? _phone;
  String? _role;
  String? _designation;
  String? _about;
  String? _lastLogin;
  String? _memberSince;
  String? _timezone;

  String? _companyName;
  String _language = 'English';
  String _dateFormat = 'DD MMM YYYY';
  String _theme = 'Light';
  int? _storageUsed;
  int? _storageQuota;
  int? _warehouseCount;
  int? _userCount;

  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _companyCtrl = TextEditingController();
  final _designationCtrl = TextEditingController();
  final _aboutCtrl = TextEditingController();

  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 4, vsync: this);
    _aboutCtrl.text = 'Overseeing all operations and system configurations.';
    _load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _companyCtrl.dispose();
    _designationCtrl.dispose();
    _aboutCtrl.dispose();
    super.dispose();
  }

  Map<String, dynamic>? _asMap(dynamic body) {
    if (body is Map && body['data'] != null) {
      final d = body['data'];
      if (d is Map) return Map<String, dynamic>.from(d);
    }
    if (body is Map) return Map<String, dynamic>.from(body);
    return null;
  }

  List<dynamic> _asList(dynamic body) {
    if (body is Map && body['data'] is List) return body['data'] as List;
    if (body is List) return body;
    return [];
  }

    Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      Map<String, dynamic>? user;
      Map<String, dynamic>? company;

      // 1) Login cache
      try {
        final rawU = await SecureStorage.instance.readUserJson();
        if (rawU != null && rawU.isNotEmpty) {
          final d = jsonDecode(rawU);
          if (d is Map) user = Map<String, dynamic>.from(d);
        }
        final rawC = await SecureStorage.instance.readCompanyJson();
        if (rawC != null && rawC.isNotEmpty) {
          final d = jsonDecode(rawC);
          if (d is Map) company = Map<String, dynamic>.from(d);
        }
      } catch (_) {}

      // 2) Company API
      try {
        final cRes = await ApiClient.instance.dio.get('/companies/me');
        final parsed = _asMap(cRes.data);
        if (parsed != null) company = parsed;
      } catch (_) {}

      // 3) Users list (always try — fill gaps)
      try {
        final r = await ApiClient.instance.dio.get('/users');
        final list = _asList(r.data);
        if (list.isNotEmpty) {
          Map<String, dynamic>? match;
          for (final item in list) {
            if (item is! Map) continue;
            final m = Map<String, dynamic>.from(item);
            if (user != null &&
                user['email'] != null &&
                m['email']?.toString() == user['email']?.toString()) {
              match = m;
              break;
            }
            if (user != null &&
                user['id'] != null &&
                m['id']?.toString() == user['id']?.toString()) {
              match = m;
              break;
            }
          }
          match ??= list.first is Map
              ? Map<String, dynamic>.from(list.first as Map)
              : null;
          if (match != null) {
            user = {...?user, ...match};
          }
        }
      } catch (_) {}

      if (!mounted) return;
      setState(() {
        if (company != null) {
          _companyName = company['companyName']?.toString() ??
              company['name']?.toString();
          _companyCtrl.text = _companyName ?? '';
          _storageUsed = int.tryParse('${company['storageUsed'] ?? 0}');
          _storageQuota =
              int.tryParse('${company['storageQuota'] ?? 10737418240}');
          _timezone = company['timezone']?.toString() ?? 'Asia/Kolkata';
        }

        if (user != null) {
          _userId = user['id']?.toString();
          _name = user['name']?.toString() ??
              user['ownerName']?.toString() ??
              '';
          _email = user['email']?.toString() ?? '';
          _phone = user['phone']?.toString() ?? '';
          _role = user['role']?.toString() ?? 'owner';
          _lastLogin = user['lastLoginAt']?.toString();
          _memberSince = user['joiningDate']?.toString() ??
              user['createdAt']?.toString();
        } else {
          _role = 'owner';
          _name = '';
          _email = '';
          _phone = '';
        }

        _designation = _roleLabel(_role);
        _nameCtrl.text = _name ?? '';
        _emailCtrl.text = _email ?? '';
        _phoneCtrl.text = _phone ?? '';
        _designationCtrl.text = _designation ?? '';
        if (_aboutCtrl.text.trim().isEmpty) {
          _aboutCtrl.text =
              'Overseeing all operations and system configurations.';
        }
        _loading = false;
      });

      // persist latest user for next time
      if (user != null) {
        try {
          await SecureStorage.instance.saveUserJson(jsonEncode(user));
        } catch (_) {}
      }
      if (company != null) {
        try {
          await SecureStorage.instance.saveCompanyJson(jsonEncode(company));
        } catch (_) {}
      }

      _loadCounts();
    } on DioException catch (e) {
      setState(() {
        _error = e.message ?? 'Failed to load profile';
        _loading = false;
      });
    }
  }
  Future<void> _loadCounts() async {
    try {
      final w = await ApiClient.instance.dio.get('/warehouses');
      final u = await ApiClient.instance.dio.get('/users');
      if (!mounted) return;
      setState(() {
        _warehouseCount = _asList(w.data).length;
        _userCount = _asList(u.data).length;
      });
    } catch (_) {}
  }

  String _roleLabel(String? r) {
    switch (r) {
      case 'owner':
      case 'super_admin':
        return 'Super Administrator';
      case 'manager':
        return 'Manager';
      case 'supervisor':
        return 'Supervisor';
      case 'packing_operator':
        return 'Packing Operator';
      default:
        return r ?? 'User';
    }
  }

  String _fmtDate(String? iso) {
    if (iso == null || iso.isEmpty) return '—';
    try {
      final d = DateTime.parse(iso).toLocal();
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return '${d.day.toString().padLeft(2, '0')} ${months[d.month - 1]} ${d.year}';
    } catch (_) {
      return iso;
    }
  }

  String _fmtBytes(int b) {
    if (b < 1024) return '$b B';
    if (b < 1024 * 1024) return '${(b / 1024).toStringAsFixed(1)} KB';
    if (b < 1024 * 1024 * 1024) {
      return '${(b / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(b / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }

  Future<void> _saveProfile() async {
    setState(() => _saving = true);
    try {
      if (_companyCtrl.text.trim().isNotEmpty) {
        await ApiClient.instance.dio.patch('/companies/me', data: {
          'companyName': _companyCtrl.text.trim(),
        });
      }
      if (_userId != null) {
        try {
          await ApiClient.instance.dio.patch('/users/$_userId', data: {
            'name': _nameCtrl.text.trim(),
            'phone': _phoneCtrl.text.trim(),
          });
        } catch (_) {
          try {
            await ApiClient.instance.dio.patch('/users/me', data: {
              'name': _nameCtrl.text.trim(),
              'phone': _phoneCtrl.text.trim(),
            });
          } catch (_) {}
        }
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated')),
        );
        await _load();
      }
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.message ?? 'Update failed')),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(_error!, style: const TextStyle(color: AppColors.danger)),
            const SizedBox(height: 12),
            FilledButton(onPressed: _load, child: const Text('Retry')),
          ],
        ),
      );
    }

    final isWide = MediaQuery.of(context).size.width >= 1000;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: EdgeInsets.fromLTRB(isWide ? 24 : 16, 16, isWide ? 24 : 16, 0),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Profile',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
              SizedBox(height: 4),
              Text(
                'Manage your personal information and account preferences.',
                style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isWide ? 24 : 16),
          child: TabBar(
            controller: _tabs,
            isScrollable: true,
            labelColor: const Color(0xFF2563EB),
            unselectedLabelColor: AppColors.textSecondary,
            indicatorColor: const Color(0xFF2563EB),
            labelStyle:
                const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
            tabs: const [
              Tab(text: 'Profile Information'),
              Tab(text: 'Security'),
              Tab(text: 'Notifications'),
              Tab(text: 'Activity Log'),
            ],
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: TabBarView(
            controller: _tabs,
            children: [
              _profileTab(isWide),
              _simpleCard('Security', 'Password and session management.', [
                ListTile(
                  leading:
                      const Icon(Icons.lock_outline, color: Color(0xFF2563EB)),
                  title: const Text('Change Password'),
                  subtitle: const Text('Update your account password'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => AppDialogs.info(context,
                      title: 'Change Password',
                      message: 'Wire to forgot/reset password next.'),
                ),
                ListTile(
                  leading:
                      const Icon(Icons.devices, color: Color(0xFF2563EB)),
                  title: const Text('Active Sessions'),
                  subtitle: const Text('GET /auth/sessions'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () async {
                    try {
                      final res =
                          await ApiClient.instance.dio.get('/auth/sessions');
                      if (!mounted) return;
                      AppDialogs.info(context,
                          title: 'Sessions', message: '${res.data}');
                    } catch (e) {
                      if (!mounted) return;
                      AppDialogs.info(context,
                          title: 'Sessions', message: '$e');
                    }
                  },
                ),
              ]),
              _simpleCard(
                'Notifications',
                'Email and in-app preferences — coming with Notifications module.',
                const [],
              ),
              _simpleCard(
                'Activity Log',
                'Audit trail from GET /audit-logs — next iteration.',
                const [],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _profileTab(bool isWide) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final pad = isWide ? 24.0 : 16.0;
        if (!isWide) {
          return ListView(
            padding: EdgeInsets.all(pad),
            children: [
              _identityCard(),
              const SizedBox(height: 16),
              _profileForm(),
              const SizedBox(height: 16),
              _accountOverview(),
            ],
          );
        }
        return SingleChildScrollView(
          padding: EdgeInsets.all(pad),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(width: 260, child: _identityCard()),
                const SizedBox(width: 20),
                Expanded(flex: 3, child: _profileForm()),
                const SizedBox(width: 20),
                SizedBox(width: 260, child: _accountOverview()),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _identityCard() {
    final n = _name ?? '';
    final initial = n.isNotEmpty ? n[0].toUpperCase() : '?';
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 44,
                backgroundColor: const Color(0xFF2563EB).withOpacity(0.12),
                child: Text(initial,
                    style: const TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF2563EB))),
              ),
              Positioned(
                right: 0,
                bottom: 0,
                child: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: const Icon(Icons.camera_alt,
                      size: 14, color: Colors.white),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(n.isEmpty ? '—' : n,
              style:
                  const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFF2563EB).withOpacity(0.1),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(_roleLabel(_role),
                style: const TextStyle(
                    color: Color(0xFF2563EB),
                    fontSize: 11,
                    fontWeight: FontWeight.w600)),
          ),
          const SizedBox(height: 16),
          _infoRow(Icons.mail_outline, _email ?? '—'),
          const SizedBox(height: 8),
          _infoRow(Icons.phone_outlined, _phone ?? '—'),
          const Divider(height: 28),
          _meta('Member since', _fmtDate(_memberSince)),
          const SizedBox(height: 8),
          _meta('Last login', _fmtDate(_lastLogin)),
          const SizedBox(height: 8),
          _meta('Time zone', _timezone ?? 'Asia/Kolkata'),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => AppDialogs.info(context,
                  title: 'Change Password',
                  message: 'Use Security tab.'),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Change Password'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(IconData i, String t) {
    return Row(
      children: [
        Icon(i, size: 16, color: AppColors.textSecondary),
        const SizedBox(width: 8),
        Expanded(
          child: Text(t,
              style: const TextStyle(
                  fontSize: 12, color: AppColors.textSecondary),
              overflow: TextOverflow.ellipsis),
        ),
      ],
    );
  }

  Widget _meta(String k, String v) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(k,
            style:
                const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        Flexible(
          child: Text(v,
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
              textAlign: TextAlign.right),
        ),
      ],
    );
  }

  Widget _profileForm() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(child: _field('Full Name', _nameCtrl)),
              const SizedBox(width: 16),
              Expanded(child: _field('Company', _companyCtrl)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                  child: _field('Email Address', _emailCtrl, enabled: false)),
              const SizedBox(width: 16),
              Expanded(
                child: _dropdown('Language', _language, const ['English', 'Hindi'],
                    (v) => setState(() => _language = v ?? 'English')),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _field('Phone Number', _phoneCtrl)),
              const SizedBox(width: 16),
              Expanded(
                child: _dropdown(
                  'Date Format',
                  _dateFormat,
                  const ['DD MMM YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
                  (v) => setState(() => _dateFormat = v ?? 'DD MMM YYYY'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: _field('Designation', _designationCtrl)),
              const SizedBox(width: 16),
              Expanded(
                child: _dropdown(
                  'Theme',
                  _theme,
                  const ['Light', 'Dark', 'System'],
                  (v) => setState(() => _theme = v ?? 'Light'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text('About',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          TextField(
            controller: _aboutCtrl,
            maxLines: 3,
            decoration: _inputDec(),
          ),
          const SizedBox(height: 20),
          Align(
            alignment: Alignment.centerRight,
            child: FilledButton(
              onPressed: _saving ? null : _saveProfile,
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF2563EB),
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
              child: _saving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : const Text('Update Profile'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _field(String label, TextEditingController c, {bool enabled = true}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        TextField(controller: c, enabled: enabled, decoration: _inputDec()),
      ],
    );
  }

  Widget _dropdown(String label, String value, List<String> items,
      ValueChanged<String?> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          value: items.contains(value) ? value : items.first,
          items: items
              .map((e) => DropdownMenuItem(value: e, child: Text(e)))
              .toList(),
          onChanged: onChanged,
          decoration: _inputDec(),
        ),
      ],
    );
  }

  InputDecoration _inputDec() {
    return InputDecoration(
      filled: true,
      fillColor: const Color(0xFFF8FAFC),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: Color(0xFF2563EB), width: 1.5),
      ),
    );
  }

  Widget _accountOverview() {
    final used = _storageUsed ?? 0;
    final quota = _storageQuota ?? 10737418240;
    final pct = quota > 0 ? (used / quota).clamp(0.0, 1.0) : 0.0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('Account Overview',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
          const SizedBox(height: 16),
          _ov(Icons.badge_outlined, 'Role', _roleLabel(_role)),
          _ov(
            Icons.fingerprint,
            'User ID',
            _userId != null && _userId!.length >= 4
                ? 'USR-${_userId!.substring(0, 4).toUpperCase()}'
                : (_userId ?? '—'),
          ),
          _ov(Icons.apartment, 'Companies', '1'),
          _ov(Icons.warehouse_outlined, 'Warehouses',
              '${_warehouseCount ?? 0}'),
          _ov(Icons.people_outline, 'Total Users', '${_userCount ?? 0}'),
          const SizedBox(height: 8),
          const Text('Storage Used',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          const SizedBox(height: 6),
          Text(
            '${_fmtBytes(used)} / ${_fmtBytes(quota)}',
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: pct,
              minHeight: 6,
              backgroundColor: AppColors.border,
              color: const Color(0xFF2563EB),
            ),
          ),
          const SizedBox(height: 4),
          Text('${(pct * 100).toStringAsFixed(0)}%',
              style: const TextStyle(
                  fontSize: 11, color: AppColors.textSecondary)),
        ],
      ),
    );
  }

  Widget _ov(IconData i, String k, String v) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Icon(i, size: 18, color: const Color(0xFF2563EB)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(k,
                style: const TextStyle(
                    fontSize: 12, color: AppColors.textSecondary)),
          ),
          Text(v,
              style:
                  const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _simpleCard(String title, String subtitle, List<Widget> children) {
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title,
                  style: const TextStyle(
                      fontWeight: FontWeight.w700, fontSize: 16)),
              const SizedBox(height: 8),
              Text(subtitle,
                  style: const TextStyle(
                      fontSize: 13, color: AppColors.textSecondary)),
              if (children.isNotEmpty) ...[
                const SizedBox(height: 16),
                ...children,
              ],
            ],
          ),
        ),
      ],
    );
  }
}