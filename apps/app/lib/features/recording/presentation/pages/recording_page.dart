import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:go_router/go_router.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class RecordingPage extends StatefulWidget {
  final String? orderId;
  final bool autostart;

  const RecordingPage({
    super.key,
    this.orderId,
    this.autostart = false,
  });

  @override
  State<RecordingPage> createState() => _RecordingPageState();
}

class _RecordingPageState extends State<RecordingPage> {
  final Dio _dio = ApiClient.dio;

  bool isLoading = true;
  bool isActionLoading = false;
  String? errorMessage;

  Map<String, dynamic>? order;
  Map<String, dynamic>? profile;
  List<Map<String, dynamic>> recordings = [];
  Map<String, dynamic>? activeSession;

  bool isRecording = false;
  int elapsedSeconds = 0;
  DateTime? _startedAt;
  bool _didAutostart = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Map<String, dynamic>? _unwrap(dynamic body) {
    if (body is! Map) return null;
    final map = Map<String, dynamic>.from(body);
    if (map['data'] is Map) {
      return Map<String, dynamic>.from(map['data'] as Map);
    }
    // Some APIs nest under data.user
    if (map['data'] is Map && (map['data'] as Map)['user'] is Map) {
      return Map<String, dynamic>.from((map['data'] as Map)['user'] as Map);
    }
    return map;
  }

  Future<Response?> _safeGet(String path, {Map<String, dynamic>? query}) async {
    try {
      return await _dio.get(path, queryParameters: query);
    } catch (e) {
      debugPrint('GET $path failed: $e');
      return null;
    }
  }

  Future<void> _load() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      // ── Profile (operator id) ──────────────────────────
      try {
        final profileRes = await _dio.get(ApiEndpoints.profile);
        var p = _unwrap(profileRes.data);
        // Flat response without data wrapper
        if (p == null && profileRes.data is Map) {
          p = Map<String, dynamic>.from(profileRes.data as Map);
        }
        // Nested user
        if (p != null && p['id'] == null && p['user'] is Map) {
          p = Map<String, dynamic>.from(p['user'] as Map);
        }
        profile = p;
        debugPrint('Profile loaded: id=${profile?['id']} email=${profile?['email']}');
      } catch (e) {
        debugPrint('Profile error: $e');
        profile = null;
      }

      // ── Order ──────────────────────────────────────────
      final oid = widget.orderId;
      if (oid != null && oid.isNotEmpty) {
        try {
          final orderRes = await _dio.get('${ApiEndpoints.orders}/$oid');
          order = _unwrap(orderRes.data) ??
              (orderRes.data is Map
                  ? Map<String, dynamic>.from(orderRes.data as Map)
                  : null);
        } catch (_) {
          final listRes = await _safeGet(
            ApiEndpoints.orders,
            query: {'page': 1, 'limit': 50},
          );
          final data = _unwrap(listRes?.data);
          if (data != null && data['items'] is List) {
            for (final e in data['items'] as List) {
              final m = Map<String, dynamic>.from(e as Map);
              if (m['id']?.toString() == oid ||
                  m['orderNumber']?.toString() == oid) {
                order = m;
                break;
              }
            }
          }
        }
      }

      // ── Recordings ─────────────────────────────────────
      final recRes = await _safeGet(
        ApiEndpoints.recordings,
        query: {'page': 1, 'limit': 30},
      );
      List items = [];
      final rd = _unwrap(recRes?.data);
      if (rd != null) {
        if (rd['items'] is List) items = rd['items'] as List;
        else if (rd['data'] is List) items = rd['data'] as List;
      } else if (recRes?.data is List) {
        items = recRes!.data as List;
      }

      recordings = items.map<Map<String, dynamic>>((e) {
        final m = Map<String, dynamic>.from(e as Map);
        return {
          'id': m['id']?.toString() ?? '',
          'orderId': m['orderId']?.toString() ?? '',
          'status': (m['status'] ?? 'CREATED').toString(),
          'duration': m['durationSeconds'] ?? 0,
          'fileUrl': m['fileUrl']?.toString(),
          'createdAt': m['createdAt']?.toString(),
          'raw': m,
        };
      }).toList();

      if (order != null) {
        final oid2 = order!['id']?.toString();
        final match = recordings.where((r) => r['orderId'] == oid2).toList();
        if (match.isNotEmpty) {
          activeSession = match.first;
          final st = activeSession!['status'].toString().toUpperCase();
          isRecording = st == 'STARTED' || st == 'RESUMED';
        }
      }

      setState(() => isLoading = false);

      // Auto-start once after load
      if (widget.autostart &&
          !_didAutostart &&
          order != null &&
          !isRecording) {
        _didAutostart = true;
        // small delay for UI
        Future.delayed(const Duration(milliseconds: 300), () {
          if (mounted) _startRecording();
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = e.toString();
      });
    }
  }

  Future<void> _startRecording() async {
    if (order == null) {
      _toast('No order loaded — scan an order first', error: true);
      return;
    }

    // Re-fetch profile if missing
    if (profile == null || profile!['id'] == null) {
      try {
        final profileRes = await _dio.get(ApiEndpoints.profile);
        profile = _unwrap(profileRes.data) ??
            (profileRes.data is Map
                ? Map<String, dynamic>.from(profileRes.data as Map)
                : null);
        if (profile != null && profile!['id'] == null && profile!['user'] is Map) {
          profile = Map<String, dynamic>.from(profile!['user'] as Map);
        }
      } catch (_) {}
    }

    setState(() => isActionLoading = true);

    try {
      final companyId =
          order!['companyId']?.toString() ?? profile?['companyId']?.toString();
      final warehouseId = order!['warehouseId']?.toString();
      final orderId = order!['id']?.toString();
      final operatorId = profile?['id']?.toString();

      if (operatorId == null || operatorId.isEmpty) {
        throw Exception(
          'Operator id missing. Token may be invalid — logout and login again. '
          'Profile: ${profile?.toString() ?? "null"}',
        );
      }

      if (companyId == null || warehouseId == null || orderId == null) {
        throw Exception(
          'Missing ids (company=$companyId warehouse=$warehouseId order=$orderId)',
        );
      }

      final createRes = await _dio.post(
        ApiEndpoints.recordings,
        data: {
          'companyId': companyId,
          'warehouseId': warehouseId,
          'orderId': orderId,
          'operatorId': operatorId,
          'originalFileName':
              'pack_${order!['orderNumber'] ?? orderId}_${DateTime.now().millisecondsSinceEpoch}.mp4',
        },
      );

      final session = _unwrap(createRes.data) ??
          (createRes.data is Map
              ? Map<String, dynamic>.from(createRes.data as Map)
              : null);

      if (session == null || session['id'] == null) {
        throw Exception('Create recording returned no id: ${createRes.data}');
      }

      final sessionId = session['id'].toString();
      await _dio.post('${ApiEndpoints.recordings}/$sessionId/start');

      setState(() {
        activeSession = {
          'id': sessionId,
          'orderId': orderId,
          'status': 'STARTED',
          'duration': 0,
        };
        isRecording = true;
        elapsedSeconds = 0;
        _startedAt = DateTime.now();
        isActionLoading = false;
      });

      _tick();
      _toast('Recording started');
    } catch (e) {
      setState(() => isActionLoading = false);
      _toast(_err(e), error: true);
    }
  }

  Future<void> _stopRecording() async {
    final id = activeSession?['id']?.toString();
    if (id == null) return;

    setState(() => isActionLoading = true);
    try {
      await _dio.post('${ApiEndpoints.recordings}/$id/stop');
      setState(() {
        isRecording = false;
        activeSession = {
          ...?activeSession,
          'status': 'STOPPED',
          'duration': elapsedSeconds,
        };
        isActionLoading = false;
      });
      _toast('Recording stopped');
      await _load();
    } catch (e) {
      setState(() => isActionLoading = false);
      _toast(_err(e), error: true);
    }
  }

  void _tick() {
    if (!isRecording || _startedAt == null) return;
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted || !isRecording) return;
      setState(() {
        elapsedSeconds = DateTime.now().difference(_startedAt!).inSeconds;
      });
      _tick();
    });
  }

  String _err(Object e) {
    if (e is DioException) {
      final d = e.response?.data;
      if (d is Map) {
        return (d['message'] ?? d['error'] ?? e.message ?? 'Request failed')
            .toString();
      }
      return e.message ?? 'Request failed (${e.response?.statusCode})';
    }
    return e.toString().replaceFirst('Exception: ', '');
  }

  void _toast(String msg, {bool error = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: error ? Colors.red.shade700 : null,
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: error ? 6 : 3),
      ),
    );
  }

  String _fmtDuration(int secs) {
    final m = (secs ~/ 60).toString().padLeft(2, '0');
    final s = (secs % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  String _fmtDate(dynamic raw) {
    if (raw == null) return '—';
    try {
      final dt = DateTime.parse(raw.toString()).toLocal();
      return '${dt.day}/${dt.month} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return raw.toString();
    }
  }

  String get _operatorLabel {
    if (profile == null) return 'Not logged in';
    final name = [
      profile!['firstName'],
      profile!['lastName'],
    ].where((e) => e != null && e.toString().isNotEmpty).join(' ');
    if (name.isNotEmpty) return name;
    return profile!['email']?.toString() ??
        profile!['id']?.toString() ??
        '—';
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: 'Recordings & Evidence',
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : errorMessage != null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(errorMessage!),
                      const SizedBox(height: 12),
                      FilledButton(onPressed: _load, child: const Text('Retry')),
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
                          TextButton.icon(
                            onPressed: () => context.go('/scanning'),
                            icon: const Icon(Icons.arrow_back, size: 16),
                            label: const Text('Back to Scanning'),
                          ),
                          const Spacer(),
                          if (profile == null)
                            TextButton.icon(
                              onPressed: () => context.go('/login'),
                              icon: const Icon(Icons.login, size: 16),
                              label: const Text('Re-login (profile missing)'),
                              style: TextButton.styleFrom(
                                  foregroundColor: Colors.red),
                            ),
                          OutlinedButton.icon(
                            onPressed: _load,
                            icon: const Icon(Icons.refresh, size: 16),
                            label: const Text('Refresh'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
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
                                    _playerCard(),
                                    const SizedBox(height: 16),
                                    _allRecordingsCard(),
                                  ],
                                ),
                              ),
                              SizedBox(
                                  width: wide ? 16 : 0, height: wide ? 0 : 16),
                              Expanded(flex: 4, child: _detailsCard()),
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _playerCard() {
    return Container(
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
                'Latest Recording',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E2329),
                ),
              ),
              const Spacer(),
              if (isRecording)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                            color: Colors.red, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'REC  ${_fmtDuration(elapsedSeconds)}',
                        style: TextStyle(
                          color: Colors.red.shade700,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
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
                  Icon(
                    isRecording ? Icons.videocam : Icons.videocam_off,
                    size: 56,
                    color: Colors.white24,
                  ),
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: Text(
                      isRecording
                          ? 'Session active on server — device camera next'
                          : 'Press Start Recording (or scan again for auto-start)',
                      textAlign: TextAlign.center,
                      style:
                          const TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                  ),
                  if (isRecording)
                    Positioned(
                      top: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          '● REC',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              if (!isRecording)
                Expanded(
                  child: FilledButton.icon(
                    onPressed: isActionLoading ? null : _startRecording,
                    icon: const Icon(Icons.fiber_manual_record, size: 18),
                    label:
                        Text(isActionLoading ? 'Starting…' : 'Start Recording'),
                    style: FilledButton.styleFrom(
                      backgroundColor: Colors.red.shade600,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                )
              else
                Expanded(
                  child: FilledButton.icon(
                    onPressed: isActionLoading ? null : _stopRecording,
                    icon: const Icon(Icons.stop, size: 18),
                    label:
                        Text(isActionLoading ? 'Stopping…' : 'Stop Recording'),
                    style: FilledButton.styleFrom(
                      backgroundColor: const Color(0xFF1E2329),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ),
              const SizedBox(width: 10),
              OutlinedButton.icon(
                onPressed: () => context.go('/scanning'),
                icon: const Icon(Icons.qr_code_scanner, size: 16),
                label: const Text('Scan next'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 14),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _detailsCard() {
    final o = order;
    return Container(
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
            'Recording Details',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E2329),
            ),
          ),
          const SizedBox(height: 16),
          if (o == null)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Column(
                children: [
                  Text(
                    'No order linked. Scan an order first.',
                    style:
                        TextStyle(color: Colors.grey.shade600, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: () => context.go('/scanning'),
                    child: const Text('Go to Scanning'),
                  ),
                ],
              ),
            )
          else ...[
            _row('Order ID', (o['orderNumber'] ?? o['id'] ?? '—').toString()),
            _row('Customer', (o['customerName'] ?? '—').toString()),
            _row('Status', (o['status'] ?? '—').toString()),
            _row('Marketplace', (o['marketplace'] ?? '—').toString()),
            _row('AWB',
                (o['awbNumber'] ?? o['trackingNumber'] ?? '—').toString()),
            const Divider(height: 28),
            _row(
              'Session',
              activeSession?['id'] != null
                  ? activeSession!['id'].toString().substring(0, 8)
                  : '—',
            ),
            _row('Session status',
                (activeSession?['status'] ?? 'None').toString()),
            _row(
              'Duration',
              isRecording
                  ? _fmtDuration(elapsedSeconds)
                  : _fmtDuration(
                      (activeSession?['duration'] as num?)?.toInt() ?? 0),
            ),
            _row('Operator', _operatorLabel),
          ],
        ],
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(label,
                style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1E2329),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _allRecordingsCard() {
    return Container(
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
            'All Recordings',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E2329),
            ),
          ),
          const SizedBox(height: 12),
          if (recordings.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Text(
                  'No recording sessions yet',
                  style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
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
                      label: Text('Session',
                          style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(
                      label: Text('Order',
                          style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(
                      label: Text('Status',
                          style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(
                      label: Text('Created',
                          style: TextStyle(fontWeight: FontWeight.bold))),
                ],
                rows: recordings.take(15).map((r) {
                  final st = r['status'].toString();
                  final color = st.contains('STOP') || st.contains('UPLOAD')
                      ? Colors.green
                      : st.contains('START') || st.contains('RESUME')
                          ? Colors.red
                          : Colors.orange;
                  return DataRow(cells: [
                    DataCell(Text(r['id'].toString().length > 8
                        ? r['id'].toString().substring(0, 8)
                        : r['id'].toString())),
                    DataCell(Text(r['orderId'].toString().length > 8
                        ? r['orderId'].toString().substring(0, 8)
                        : r['orderId'].toString())),
                    DataCell(Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(st,
                          style: TextStyle(
                              color: color,
                              fontSize: 11,
                              fontWeight: FontWeight.bold)),
                    )),
                    DataCell(Text(_fmtDate(r['createdAt']),
                        style: TextStyle(
                            fontSize: 12, color: Colors.grey.shade600))),
                  ]);
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }
}
