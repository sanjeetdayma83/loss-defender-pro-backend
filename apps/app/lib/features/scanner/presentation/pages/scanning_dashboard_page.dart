import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:dio/dio.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class ScanningDashboardPage extends StatefulWidget {
  const ScanningDashboardPage({super.key});

  @override
  State<ScanningDashboardPage> createState() => _ScanningDashboardPageState();
}

class _ScanningDashboardPageState extends State<ScanningDashboardPage>
    with SingleTickerProviderStateMixin {
  final Dio _dio = ApiClient.dio;
  final TextEditingController _barcodeCtrl = TextEditingController();
  final FocusNode _barcodeFocus = FocusNode();

  bool isLoading = true;
  bool isLookingUp = false;
  String? errorMessage;

  List<Map<String, dynamic>> scans = [];
  Map<String, dynamic>? scanResult;
  String? lookupError;
  String? lastRawInput; // debug: what scanner actually sent

  int totalScans = 0;
  int verifiedScans = 0;
  int pendingScans = 0;
  int exceptionScans = 0;

  // Hardware scanner often types very fast then Enter.
  // Buffer keystrokes if focus is elsewhere.
  String _wedgeBuffer = '';
  DateTime? _lastKeyAt;

  late AnimationController _laserCtrl;

  @override
  void initState() {
    super.initState();
    _laserCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    // Auto-focus barcode field so USB/BT scanners work immediately
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _barcodeFocus.requestFocus();
    });

    fetchData();
  }

  @override
  void dispose() {
    _barcodeCtrl.dispose();
    _barcodeFocus.dispose();
    _laserCtrl.dispose();
    super.dispose();
  }

  /// Clean scanner input: trim, remove CR/LF, zero-width chars
  String _sanitize(String raw) {
    return raw
        .replaceAll('\r', '')
        .replaceAll('\n', '')
        .replaceAll('\t', '')
        .trim();
  }

  Map<String, dynamic>? _unwrap(dynamic body) {
    if (body is! Map) return null;
    final map = Map<String, dynamic>.from(body);
    if (map['data'] is Map) {
      return Map<String, dynamic>.from(map['data'] as Map);
    }
    return map;
  }

  Future<Response?> _safeGet(String path, {Map<String, dynamic>? query}) async {
    try {
      return await _dio.get(path, queryParameters: query);
    } catch (_) {
      return null;
    }
  }

  Future<void> fetchData() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final scanRes = await _safeGet(
        ApiEndpoints.scans,
        query: {'page': 1, 'limit': 30},
      );

      List items = [];
      final data = _unwrap(scanRes?.data);
      if (data != null) {
        if (data['items'] is List) {
          items = data['items'] as List;
          totalScans = (data['total'] as num?)?.toInt() ?? items.length;
        } else if (data['data'] is List) {
          items = data['data'] as List;
          totalScans = items.length;
        }
      } else if (scanRes?.data is List) {
        items = scanRes!.data as List;
        totalScans = items.length;
      }

      scans = items.map<Map<String, dynamic>>((e) {
        final m = Map<String, dynamic>.from(e as Map);
        return {
          'id': m['id']?.toString() ?? '',
          'barcode': m['barcode']?.toString() ?? '—',
          'orderId': m['orderId']?.toString() ?? '—',
          'status': (m['status'] ?? 'PENDING').toString(),
          'scannedAt': _formatTime(m['scannedAt'] ?? m['createdAt']),
        };
      }).toList();

      pendingScans = scans
          .where((s) => s['status'].toString().toUpperCase().contains('PEND'))
          .length;
      verifiedScans = scans.where((s) {
        final st = s['status'].toString().toUpperCase();
        return st.contains('VERIF') ||
            st.contains('MATCH') ||
            st.contains('SUCCESS');
      }).length;
      exceptionScans = scans.where((s) {
        final st = s['status'].toString().toUpperCase();
        return st.contains('FAIL') ||
            st.contains('EXCEPT') ||
            st.contains('ERROR');
      }).length;

      if (totalScans == 0) totalScans = scans.length;
      setState(() => isLoading = false);
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = e.toString();
      });
    }
  }

  /// Match order by exact / contains on orderNumber, awb, tracking, id
  bool _matchesOrder(Map<String, dynamic> m, String code) {
    final c = code.toUpperCase();
    final fields = [
      m['orderNumber'],
      m['awbNumber'],
      m['trackingNumber'],
      m['marketplaceOrderId'],
      m['marketplaceShipmentId'],
      m['id'],
    ];
    for (final f in fields) {
      if (f == null) continue;
      final s = f.toString().toUpperCase().trim();
      if (s.isEmpty) continue;
      if (s == c || s.contains(c) || c.contains(s)) return true;
    }
    return false;
  }

  Future<void> lookupBarcode([String? code]) async {
    final raw = code ?? _barcodeCtrl.text;
    final barcode = _sanitize(raw);

    setState(() => lastRawInput = raw);

    if (barcode.isEmpty) {
      setState(() => lookupError = 'Empty barcode — scan again');
      return;
    }

    // Put cleaned value back in field
    _barcodeCtrl.value = TextEditingValue(
      text: barcode,
      selection: TextSelection.collapsed(offset: barcode.length),
    );

    setState(() {
      isLookingUp = true;
      lookupError = null;
      scanResult = null;
    });

    try {
      Map<String, dynamic>? found;

      // 1) Scanner API by barcode
      try {
        final res = await _dio.get(
          '${ApiEndpoints.scans}/barcode/${Uri.encodeComponent(barcode)}',
        );
        found = _unwrap(res.data) ??
            (res.data is Map ? Map<String, dynamic>.from(res.data as Map) : null);
      } catch (_) {}

      // 2) Orders list — match locally (most reliable for your seed data)
      if (found == null) {
        final ordersRes = await _safeGet(
          ApiEndpoints.orders,
          query: {'page': 1, 'limit': 100, 'sortBy': 'createdAt', 'sortOrder': 'desc'},
        );
        final od = _unwrap(ordersRes?.data);
        List list = [];
        if (od != null && od['items'] is List) list = od['items'] as List;

        for (final e in list) {
          final m = Map<String, dynamic>.from(e as Map);
          if (_matchesOrder(m, barcode)) {
            found = {
              'valid': true,
              'orderNumber': m['orderNumber'],
              'orderId': m['id'],
              'awb': m['awbNumber'] ?? m['trackingNumber'] ?? barcode,
              'customer': m['customerName'] ?? '—',
              'status': m['status'],
              'marketplace': m['marketplace'],
              'priority': m['priority'],
              'items': m['items'],
              'scannedAt': DateTime.now().toIso8601String(),
              'source': 'orders',
              'matchedCode': barcode,
            };
            break;
          }
        }
      } else {
        found = {...found, 'valid': true, 'source': 'scanner', 'matchedCode': barcode};
      }

      if (found == null) {
        setState(() {
          isLookingUp = false;
          lookupError =
              'No order for "$barcode". Check barcode encodes exact Order ID (e.g. ORD-20260801-000001).';
          scanResult = {'valid': false, 'barcode': barcode};
        });
        // Keep focus for next scan
        _barcodeFocus.requestFocus();
        _barcodeCtrl.selection = TextSelection(
          baseOffset: 0,
          extentOffset: _barcodeCtrl.text.length,
        );
        return;
      }

      setState(() {
        isLookingUp = false;
        scanResult = found;
      });

      // Auto-open Recording with autostart
      final oid = found['orderId']?.toString();
      if (oid != null && oid.isNotEmpty) {
        // slight delay so UI can paint result
        Future.delayed(const Duration(milliseconds: 400), () {
          if (!mounted) return;
          context.go('/recording?orderId=$oid&autostart=1');
        });
      }

      // Select all so next scan replaces text
      _barcodeFocus.requestFocus();
      _barcodeCtrl.selection = TextSelection(
        baseOffset: 0,
        extentOffset: _barcodeCtrl.text.length,
      );
    } catch (e) {
      setState(() {
        isLookingUp = false;
        lookupError = e is DioException
            ? (e.response?.statusCode == 404
                ? 'Barcode not found'
                : (e.message ?? 'Lookup failed'))
            : e.toString();
      });
      _barcodeFocus.requestFocus();
    }
  }

  /// Global key handler for scanners when field somehow loses focus
  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent) return KeyEventResult.ignored;

    final now = DateTime.now();
    // Reset buffer if gap > 80ms (human typing is slower; scanners are bursty)
    if (_lastKeyAt != null &&
        now.difference(_lastKeyAt!).inMilliseconds > 80) {
      _wedgeBuffer = '';
    }
    _lastKeyAt = now;

    if (event.logicalKey == LogicalKeyboardKey.enter ||
        event.logicalKey == LogicalKeyboardKey.numpadEnter) {
      if (_wedgeBuffer.isNotEmpty) {
        final code = _sanitize(_wedgeBuffer);
        _wedgeBuffer = '';
        if (code.isNotEmpty) {
          lookupBarcode(code);
          return KeyEventResult.handled;
        }
      }
      // Enter while focused on field → onSubmitted handles it
      return KeyEventResult.ignored;
    }

    final ch = event.character;
    if (ch != null && ch.isNotEmpty && ch != '\n' && ch != '\r') {
      // Only buffer if barcode field is NOT focused (scanner still types)
      if (!_barcodeFocus.hasFocus) {
        _wedgeBuffer += ch;
        return KeyEventResult.handled;
      }
    }
    return KeyEventResult.ignored;
  }

  String _formatTime(dynamic raw) {
    if (raw == null) return '—';
    try {
      final dt = DateTime.parse(raw.toString()).toLocal();
      final h = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
      final am = dt.hour >= 12 ? 'PM' : 'AM';
      return '${h.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')} $am';
    } catch (_) {
      return raw.toString();
    }
  }

  Color _statusColor(String status) {
    final s = status.toUpperCase();
    if (s.contains('VERIF') ||
        s.contains('MATCH') ||
        s.contains('SUCCESS') ||
        s.contains('DELIVER') ||
        s.contains('SHIP')) {
      return Colors.green;
    }
    if (s.contains('FAIL') ||
        s.contains('EXCEPT') ||
        s.contains('ERROR') ||
        s.contains('CANCEL')) {
      return Colors.red;
    }
    return Colors.orange;
  }

  double get successRate {
    if (totalScans == 0) return 0;
    return (verifiedScans / totalScans) * 100;
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: 'Scanning',
      child: Focus(
        autofocus: true,
        onKeyEvent: _onKey,
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : errorMessage != null
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(errorMessage!),
                        const SizedBox(height: 12),
                        FilledButton(
                            onPressed: fetchData, child: const Text('Retry')),
                      ],
                    ),
                  )
                : SingleChildScrollView(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            Text('Dashboard',
                                style: TextStyle(
                                    color: Colors.grey.shade500, fontSize: 13)),
                            Icon(Icons.chevron_right,
                                size: 16, color: Colors.grey.shade400),
                            const Text('Scanning',
                                style: TextStyle(
                                    fontWeight: FontWeight.w600, fontSize: 13)),
                            const Spacer(),
                            // Re-focus helper
                            TextButton.icon(
                              onPressed: () {
                                _barcodeFocus.requestFocus();
                                _barcodeCtrl.selection = TextSelection(
                                  baseOffset: 0,
                                  extentOffset: _barcodeCtrl.text.length,
                                );
                              },
                              icon: const Icon(Icons.center_focus_strong,
                                  size: 16),
                              label: const Text('Focus scanner input'),
                            ),
                            const SizedBox(width: 8),
                            OutlinedButton.icon(
                              onPressed: fetchData,
                              icon: const Icon(Icons.refresh, size: 16),
                              label: const Text('Refresh'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        LayoutBuilder(
                          builder: (context, c) {
                            final wide = c.maxWidth > 1000;
                            return Flex(
                              direction:
                                  wide ? Axis.horizontal : Axis.vertical,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  flex: 6,
                                  child: Column(
                                    children: [
                                      _scanFrame(),
                                      const SizedBox(height: 16),
                                      _recentScansCard(),
                                    ],
                                  ),
                                ),
                                SizedBox(
                                    width: wide ? 16 : 0,
                                    height: wide ? 0 : 16),
                                Expanded(
                                  flex: 4,
                                  child: Column(
                                    children: [
                                      _statusRow(),
                                      const SizedBox(height: 12),
                                      _scanResultCard(),
                                      const SizedBox(height: 12),
                                      _summaryCard(),
                                    ],
                                  ),
                                ),
                              ],
                            );
                          },
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }

  Widget _scanFrame() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Scan Barcode / QR Code',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E2329),
            ),
          ),
          const SizedBox(height: 14),
          AspectRatio(
            aspectRatio: 16 / 9,
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF0B1220),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Positioned.fill(
                    child: CustomPaint(painter: _FramePainter()),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 28, vertical: 18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.qr_code_scanner,
                            size: 48, color: Colors.grey.shade800),
                        const SizedBox(height: 6),
                        Text(
                          _barcodeCtrl.text.isEmpty
                              ? 'Ready to scan'
                              : _barcodeCtrl.text,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                  AnimatedBuilder(
                    animation: _laserCtrl,
                    builder: (_, __) {
                      return Positioned(
                        top: 20 + (_laserCtrl.value * 160),
                        left: 40,
                        right: 40,
                        child: Container(
                          height: 2,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.transparent,
                                Colors.blue.shade400,
                                Colors.blue.shade200,
                                Colors.blue.shade400,
                                Colors.transparent,
                              ],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.blue.withValues(alpha: 0.6),
                                blurRadius: 8,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: Text(
              'Click the input below, then scan with your hardware scanner',
              style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: Divider(color: Colors.grey.shade200)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: Text('OR',
                    style: TextStyle(
                        color: Colors.grey.shade400, fontSize: 11)),
              ),
              Expanded(child: Divider(color: Colors.grey.shade200)),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: TextField(
                    controller: _barcodeCtrl,
                    focusNode: _barcodeFocus,
                    autofocus: true,
                    textInputAction: TextInputAction.done,
                    // Scanners send Enter → triggers lookup
                    onSubmitted: (v) => lookupBarcode(v),
                    // Also handle if scanner doesn't send Enter (rare)
                    onChanged: (v) {
                      // Some scanners end with tab; ignore intermediate
                      if (v.endsWith('\t')) {
                        lookupBarcode(v);
                      }
                    },
                    decoration: InputDecoration(
                      hintText: 'Focus here & scan barcode…',
                      hintStyle: TextStyle(
                          color: Colors.grey.shade400, fontSize: 13),
                      prefixIcon: Icon(Icons.qr_code_2,
                          color: Colors.grey.shade500, size: 20),
                      filled: true,
                      fillColor: _barcodeFocus.hasFocus
                          ? Colors.blue.shade50
                          : Colors.grey.shade50,
                      contentPadding: EdgeInsets.zero,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide:
                            BorderSide(color: Colors.grey.shade200),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide:
                            BorderSide(color: Colors.grey.shade200),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(
                            color: Color(0xFF155EEF), width: 2),
                      ),
                    ),
                    style: const TextStyle(
                        fontSize: 15, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              SizedBox(
                height: 48,
                child: FilledButton(
                  onPressed: isLookingUp ? null : () => lookupBarcode(),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF155EEF),
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: isLookingUp
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Lookup'),
                ),
              ),
            ],
          ),
          if (lookupError != null) ...[
            const SizedBox(height: 8),
            Text(lookupError!,
                style: TextStyle(color: Colors.red.shade600, fontSize: 12)),
          ],
          if (lastRawInput != null) ...[
            const SizedBox(height: 4),
            Text(
              'Last input received: "$lastRawInput"',
              style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
            ),
          ],
        ],
      ),
    );
  }

  Widget _statusRow() {
    return Row(
      children: [
        Expanded(
          child: _statusChip(Icons.wifi, 'Scanner Status', 'Connected', Colors.green),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _statusChip(Icons.videocam, 'Camera', 'Active', Colors.green),
        ),
      ],
    );
  }

  Widget _statusChip(
      IconData icon, String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: color),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style:
                      TextStyle(fontSize: 11, color: Colors.grey.shade500)),
              Row(
                children: [
                  Container(
                    width: 7,
                    height: 7,
                    decoration:
                        BoxDecoration(color: color, shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 5),
                  Text(value,
                      style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: color)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _scanResultCard() {
    final r = scanResult;
    final valid = r != null && r['valid'] == true;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Scan Result',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E2329),
            ),
          ),
          const SizedBox(height: 14),
          if (r == null)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Text(
                  'Scan or enter a barcode to see results',
                  style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                ),
              ),
            )
          else ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: valid ? Colors.green.shade50 : Colors.red.shade50,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: valid ? Colors.green.shade200 : Colors.red.shade200,
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    valid ? Icons.check_circle : Icons.error,
                    color: valid ? Colors.green : Colors.red,
                    size: 22,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          valid ? 'Valid Order' : 'Not Found',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: valid
                                ? Colors.green.shade800
                                : Colors.red.shade800,
                          ),
                        ),
                        Text(
                          valid
                              ? 'Order verified successfully'
                              : 'No matching order for this code',
                          style: TextStyle(
                            fontSize: 12,
                            color: valid
                                ? Colors.green.shade700
                                : Colors.red.shade700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            if (valid) ...[
              const SizedBox(height: 14),
              _detailRow('Order ID',
                  (r['orderNumber'] ?? r['orderId'] ?? '—').toString()),
              _detailRow('AWB / Tracking',
                  (r['awb'] ?? r['barcode'] ?? '—').toString()),
              _detailRow('Customer', (r['customer'] ?? '—').toString()),
              _detailRow('Status', (r['status'] ?? '—').toString()),
              _detailRow(
                  'Marketplace', (r['marketplace'] ?? '—').toString()),
              _detailRow('Priority', (r['priority'] ?? '—').toString()),
              if (r['matchedCode'] != null)
                _detailRow('Scanned code', r['matchedCode'].toString()),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                height: 44,
                child: FilledButton(
                  onPressed: () {
                    final id = r['orderId']?.toString() ?? '';
                    context.go('/recording?orderId=$id');
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF155EEF),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Start Recording / View Order'),
                      SizedBox(width: 8),
                      Icon(Icons.arrow_forward, size: 18),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(label,
                style:
                    TextStyle(fontSize: 12, color: Colors.grey.shade500)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1E2329))),
          ),
        ],
      ),
    );
  }

  Widget _summaryCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Today's Scanning Summary",
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E2329),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Column(
                  children: [
                    Icon(Icons.qr_code_scanner,
                        color: Colors.blue.shade600, size: 28),
                    const SizedBox(height: 6),
                    Text('$totalScans',
                        style: const TextStyle(
                            fontSize: 24, fontWeight: FontWeight.bold)),
                    Text('Total Scans',
                        style: TextStyle(
                            fontSize: 11, color: Colors.grey.shade500)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  children: [
                    SizedBox(
                      width: 64,
                      height: 64,
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          CircularProgressIndicator(
                            value: totalScans == 0 ? 0 : successRate / 100,
                            strokeWidth: 6,
                            backgroundColor: Colors.grey.shade100,
                            color: Colors.green,
                          ),
                          Text(
                            totalScans == 0
                                ? '—'
                                : '${successRate.toStringAsFixed(0)}%',
                            style: const TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text('Success Rate',
                        style: TextStyle(
                            fontSize: 11, color: Colors.grey.shade500)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _miniStat('Verified', '$verifiedScans', Colors.green),
              _miniStat('Pending', '$pendingScans', Colors.orange),
              _miniStat('Exceptions', '$exceptionScans', Colors.red),
            ],
          ),
        ],
      ),
    );
  }

  Widget _miniStat(String label, String value, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(value,
              style: TextStyle(
                  fontSize: 18, fontWeight: FontWeight.bold, color: color)),
          Text(label,
              style: TextStyle(fontSize: 11, color: Colors.grey.shade500)),
        ],
      ),
    );
  }

  Widget _recentScansCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
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
              const Text(
                'Recent Scans',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E2329),
                ),
              ),
              const Spacer(),
              TextButton(onPressed: fetchData, child: const Text('View All')),
            ],
          ),
          const SizedBox(height: 8),
          if (scans.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 28),
              child: Center(
                child: Text(
                  'No scans yet — lookup an order barcode to begin',
                  style:
                      TextStyle(color: Colors.grey.shade500, fontSize: 13),
                ),
              ),
            )
          else
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                headingRowColor:
                    WidgetStateProperty.all(Colors.grey.shade50),
                columns: const [
                  DataColumn(
                      label: Text('Barcode',
                          style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(
                      label: Text('Order ID',
                          style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(
                      label: Text('Status',
                          style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(
                      label: Text('Time',
                          style: TextStyle(fontWeight: FontWeight.bold))),
                ],
                rows: scans.take(8).map((s) {
                  final color = _statusColor(s['status'].toString());
                  return DataRow(cells: [
                    DataCell(Text(s['barcode'].toString())),
                    DataCell(Text(s['orderId'].toString())),
                    DataCell(Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(s['status'].toString(),
                          style: TextStyle(
                              color: color,
                              fontSize: 11,
                              fontWeight: FontWeight.bold)),
                    )),
                    DataCell(Text(s['scannedAt'].toString(),
                        style: TextStyle(
                            color: Colors.grey.shade600, fontSize: 12))),
                  ]);
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }
}

class _FramePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.7)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    const len = 28.0;
    const pad = 24.0;

    canvas.drawLine(const Offset(pad, pad), const Offset(pad + len, pad), paint);
    canvas.drawLine(const Offset(pad, pad), const Offset(pad, pad + len), paint);
    canvas.drawLine(Offset(size.width - pad, pad),
        Offset(size.width - pad - len, pad), paint);
    canvas.drawLine(Offset(size.width - pad, pad),
        Offset(size.width - pad, pad + len), paint);
    canvas.drawLine(Offset(pad, size.height - pad),
        Offset(pad + len, size.height - pad), paint);
    canvas.drawLine(Offset(pad, size.height - pad),
        Offset(pad, size.height - pad - len), paint);
    canvas.drawLine(Offset(size.width - pad, size.height - pad),
        Offset(size.width - pad - len, size.height - pad), paint);
    canvas.drawLine(Offset(size.width - pad, size.height - pad),
        Offset(size.width - pad, size.height - pad - len), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

