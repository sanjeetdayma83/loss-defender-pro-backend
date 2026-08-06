import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_theme.dart';

class ScannerScreen extends StatefulWidget {
  final String? orderId;
  const ScannerScreen({super.key, this.orderId});

  @override
  State<ScannerScreen> createState() => _ScannerScreenState();
}

class _ScannerScreenState extends State<ScannerScreen> {
  final _manualCtrl = TextEditingController();
  bool _loading = false;
  String? _error;
  String? _success;
  Map<String, dynamic>? _lastResult;
  Map<String, dynamic>? _order;
  List<Map<String, dynamic>> _recent = [];
  int _todayScans = 0;
  int _invalid = 0;
  List<dynamic> _orders = [];
  String? _selectedOrderId;

  @override
  void initState() {
    super.initState();
    _selectedOrderId = widget.orderId;
    _loadOrders();
    if (_selectedOrderId != null) _loadOrder(_selectedOrderId!);
  }

  @override
  void dispose() {
    _manualCtrl.dispose();
    super.dispose();
  }

  List<dynamic> _asList(dynamic body) {
    if (body is Map && body['data'] is List) return body['data'] as List;
    if (body is List) return body;
    return [];
  }

  Map<String, dynamic>? _asMap(dynamic body) {
    if (body is Map && body['data'] is Map) {
      return Map<String, dynamic>.from(body['data'] as Map);
    }
    if (body is Map) return Map<String, dynamic>.from(body);
    return null;
  }

  Future<void> _loadOrders() async {
    try {
      final res = await ApiClient.instance.dio.get('/orders');
      final list = _asList(res.data);
      setState(() => _orders = list);
      if (_selectedOrderId == null && list.isNotEmpty && list.first is Map) {
        _selectedOrderId = (list.first as Map)['id']?.toString();
        if (_selectedOrderId != null) _loadOrder(_selectedOrderId!);
      }
    } catch (_) {}
  }

  Future<void> _loadOrder(String id) async {
    try {
      final res = await ApiClient.instance.dio.get('/orders/$id');
      setState(() => _order = _asMap(res.data));
    } catch (_) {}
  }

  Future<void> _validate(String code) async {
    final barcode = code.trim();
    if (barcode.isEmpty) return;
    setState(() {
      _loading = true;
      _error = null;
      _success = null;
      _lastResult = null;
    });
    try {
      final res = await ApiClient.instance.dio.post('/scanner/validate', data: {
        'barcode': barcode,
        if (_selectedOrderId != null) 'orderId': _selectedOrderId,
      });
      final data = _asMap(res.data) ??
          (res.data is Map ? Map<String, dynamic>.from(res.data as Map) : null);

      final ok = data?['valid'] == true ||
          data?['matched'] == true ||
          data?['success'] == true ||
          res.statusCode == 200 ||
          res.statusCode == 201;

      setState(() {
        _lastResult = data;
        _todayScans++;
        if (ok) {
          _success = data?['message']?.toString() ?? 'Scan success';
          _recent.insert(0, {
            'code': barcode,
            'ok': true,
            'time': DateTime.now(),
            'orderId': _selectedOrderId,
          });
        } else {
          _invalid++;
          _error = data?['message']?.toString() ?? 'Invalid / mismatch';
          _recent.insert(0, {
            'code': barcode,
            'ok': false,
            'time': DateTime.now(),
          });
        }
        if (_recent.length > 12) _recent = _recent.take(12).toList();
        _loading = false;
      });
      _manualCtrl.clear();
      if (_selectedOrderId != null) _loadOrder(_selectedOrderId!);
    } on DioException catch (e) {
      setState(() {
        _loading = false;
        _invalid++;
        _error = e.response?.data is Map
            ? (e.response!.data['message'] ??
                    e.response!.data['error'] ??
                    e.message)
                ?.toString()
            : e.message ?? 'Scan failed';
        _recent.insert(0, {
          'code': barcode,
          'ok': false,
          'time': DateTime.now(),
        });
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 1000;
    final orderRef = _order?['marketplaceOrderId']?.toString() ??
        _selectedOrderId ??
        '—';

    return ListView(
      padding: EdgeInsets.all(isWide ? 24 : 16),
      children: [
        const Text('Live Scanner',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
        const SizedBox(height: 4),
        const Text('Scan barcode / QR code to verify items and capture evidence.',
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
        const SizedBox(height: 16),
        if (isWide)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 3, child: _mainPanel(orderRef)),
              const SizedBox(width: 16),
              SizedBox(width: 320, child: _sidePanel()),
            ],
          )
        else ...[
          _mainPanel(orderRef),
          const SizedBox(height: 16),
          _sidePanel(),
        ],
      ],
    );
  }

  Widget _mainPanel(String orderRef) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Order selector
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              const Text('Order:',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(width: 12),
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedOrderId,
                  isExpanded: true,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    contentPadding:
                        EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    isDense: true,
                  ),
                  items: [
                    for (final o in _orders)
                      if (o is Map)
                        DropdownMenuItem(
                          value: o['id']?.toString(),
                          child: Text(
                            o['marketplaceOrderId']?.toString() ??
                                o['id']?.toString() ??
                                '—',
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                  ],
                  onChanged: (v) {
                    setState(() => _selectedOrderId = v);
                    if (v != null) _loadOrder(v);
                  },
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // Scan viewport (manual / web-friendly)
        Container(
          height: 280,
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    _success != null
                        ? Icons.check_circle
                        : _error != null
                            ? Icons.error_outline
                            : Icons.qr_code_scanner,
                    size: 64,
                    color: _success != null
                        ? const Color(0xFF22C55E)
                        : _error != null
                            ? const Color(0xFFEF4444)
                            : Colors.white54,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    _loading
                        ? 'Validating…'
                        : _success != null
                            ? 'SCAN SUCCESS'
                            : _error != null
                                ? 'SCAN FAILED'
                                : 'Ready to scan',
                    style: TextStyle(
                      color: _success != null
                          ? const Color(0xFF22C55E)
                          : _error != null
                              ? const Color(0xFFEF4444)
                              : Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 18,
                    ),
                  ),
                  if (_success != null || _error != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      _success ?? _error ?? '',
                      style: const TextStyle(color: Colors.white70, fontSize: 13),
                      textAlign: TextAlign.center,
                    ),
                  ],
                  const SizedBox(height: 8),
                  Text('Order: $orderRef',
                      style:
                          const TextStyle(color: Colors.white54, fontSize: 12)),
                ],
              ),
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.red,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text('LIVE',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // Manual entry
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Manual Entry',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _manualCtrl,
                      textInputAction: TextInputAction.done,
                      onSubmitted: _validate,
                      decoration: InputDecoration(
                        hintText: 'Enter SKU, Order ID or Tracking No.',
                        filled: true,
                        fillColor: const Color(0xFFF8FAFC),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10),
                          borderSide: const BorderSide(color: AppColors.border),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  FilledButton(
                    onPressed: _loading
                        ? null
                        : () => _validate(_manualCtrl.text),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF2563EB),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 16),
                    ),
                    child: _loading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white))
                        : const Text('Enter'),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // Recent scans
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Recent Scans',
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
              const SizedBox(height: 10),
              if (_recent.isEmpty)
                const Text('No scans yet',
                    style:
                        TextStyle(fontSize: 13, color: AppColors.textSecondary))
              else
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final r in _recent)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: (r['ok'] == true)
                              ? const Color(0xFFDCFCE7)
                              : const Color(0xFFFEE2E2),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              r['ok'] == true
                                  ? Icons.check_circle
                                  : Icons.cancel,
                              size: 16,
                              color: r['ok'] == true
                                  ? const Color(0xFF16A34A)
                                  : const Color(0xFFDC2626),
                            ),
                            const SizedBox(width: 6),
                            Text(r['code']?.toString() ?? '',
                                style: const TextStyle(
                                    fontSize: 12, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                  ],
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _sidePanel() {
    final items = _order?['items'];
    final itemList = items is List ? items : <dynamic>[];

    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Expanded(
                    child: Text('Scan Details',
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 14)),
                  ),
                  if (_success != null)
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFDCFCE7),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text('Valid Item',
                          style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF16A34A))),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              _detail('Order ID',
                  _order?['marketplaceOrderId']?.toString() ?? _selectedOrderId ?? '—'),
              _detail('Status', _order?['status']?.toString() ?? '—'),
              _detail('Marketplace', _order?['marketplace']?.toString() ?? '—'),
              if (_lastResult != null)
                _detail('Last barcode',
                    _lastResult!['barcode']?.toString() ??
                        _manualCtrl.text),
              const Divider(height: 24),
              const Text('Items',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
              const SizedBox(height: 8),
              if (itemList.isEmpty)
                const Text('No items loaded',
                    style:
                        TextStyle(fontSize: 12, color: AppColors.textSecondary))
              else
                for (final it in itemList)
                  if (it is Map)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              '${it['sku'] ?? it['name'] ?? '—'}',
                              style: const TextStyle(fontSize: 12),
                            ),
                          ),
                          Text(
                            'x${it['qty'] ?? it['quantity'] ?? 1}',
                            style: const TextStyle(
                                fontSize: 12, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("Today's Summary",
                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                      child: _miniStat('Total Scans', '$_todayScans',
                          const Color(0xFF3B82F6))),
                  const SizedBox(width: 8),
                  Expanded(
                      child: _miniStat(
                          'Invalid', '$_invalid', const Color(0xFFEF4444))),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _detail(String k, String v) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 90,
            child: Text(k,
                style: const TextStyle(
                    fontSize: 11, color: AppColors.textSecondary)),
          ),
          Expanded(
            child: Text(v,
                style:
                    const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  Widget _miniStat(String t, String v, Color c) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: c.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(v,
              style: TextStyle(
                  fontSize: 20, fontWeight: FontWeight.w800, color: c)),
          Text(t,
              style: const TextStyle(
                  fontSize: 11, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}