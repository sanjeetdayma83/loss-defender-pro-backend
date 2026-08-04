// import upload_service;
import 'dart:async';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:go_router/go_router.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:path/path.dart' as path;
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
  DateTime _liveClock = DateTime.now();
  Timer? _clockTimer;
  bool _didAutostart = false;

  // Camera
  CameraController? _cameraController;
  List<CameraDescription> _cameras = [];
  bool _cameraReady = false;
  bool _isInitializingCamera = false;
  String? _cameraError;
  XFile? _lastVideoFile;

  @override
  void initState() {
    super.initState();
    _load();
    _initCamera();
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  Future<void> _initCamera() async {
    if (kIsWeb) {
      setState(() {
        _cameraError = 'Camera recording works best on mobile/tablet.';
      });
      return;
    }

    setState(() => _isInitializingCamera = true);

    // CRUCIAL FIX: Wait for previous scanner (mobile_scanner) to release camera lock
    await Future.delayed(const Duration(milliseconds: 800));

    try {
      final camStatus = await Permission.camera.request();
      final micStatus = await Permission.microphone.request();

      if (!camStatus.isGranted) {
        setState(() {
          _cameraError = 'Camera permission denied';
          _isInitializingCamera = false;
        });
        return;
      }

      _cameras = await availableCameras();
      if (_cameras.isEmpty) {
        setState(() {
          _cameraError = 'No cameras found';
          _isInitializingCamera = false;
        });
        return;
      }

      final camera = _cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.back,
        orElse: () => _cameras.first,
      );

      _cameraController = CameraController(
        camera,
        ResolutionPreset.high,
        enableAudio: micStatus.isGranted,
        imageFormatGroup: ImageFormatGroup.jpeg,
      );

      await _cameraController!.initialize();

      if (!mounted) { return; }
      setState(() {
        _cameraReady = true;
        _isInitializingCamera = false;
        _cameraError = null;
      });
    } catch (e) {
      setState(() {
        _cameraError = 'Camera init failed: $e';
        _isInitializingCamera = false;
      });
    }
  }

  Future<void> _startCameraRecording() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) { return; }
    if (_cameraController!.value.isRecordingVideo) { return; }

    try {
      await _cameraController!.startVideoRecording();
    } catch (e) {
      debugPrint('Start video recording failed: $e');
      _toast('Failed to start camera recording: $e', error: true);
    }
  }

  Future<XFile?> _stopCameraRecording() async {
    if (_cameraController == null || !_cameraController!.value.isRecordingVideo) { return null; }
    try {
      return await _cameraController!.stopVideoRecording();
    } catch (e) {
      debugPrint('Stop video recording failed: $e');
      return null;
    }
  }

  Map<String, dynamic>? _unwrap(dynamic body) {
    if (body is! Map) { return null; }
    final map = Map<String, dynamic>.from(body);
    if (map['data'] is Map) { return Map<String, dynamic>.from(map['data'] as Map); }
    if (map['data'] is Map && (map['data'] as Map)['user'] is Map) {
      return Map<String, dynamic>.from((map['data'] as Map)['user'] as Map);
    }
    return map;
  }

  Future<Response?> _safeGet(String path, {Map<String, dynamic>? query}) async {
    try {
      return await _dio.get(path, queryParameters: query);
    } catch (e) {
      return null;
    }
  }

  Future<void> _load() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      try {
        final profileRes = await _dio.get(ApiEndpoints.profile);
        var p = _unwrap(profileRes.data);
        if (p == null && profileRes.data is Map) { p = Map<String, dynamic>.from(profileRes.data as Map); }
        if (p != null && p['id'] == null && p['user'] is Map) { p = Map<String, dynamic>.from(p['user'] as Map); }
        profile = p;
      } catch (_) {
        profile = null;
      }

      final oid = widget.orderId;
      if (oid != null && oid.isNotEmpty) {
        try {
          final orderRes = await _dio.get('${ApiEndpoints.orders}/$oid');
          order = _unwrap(orderRes.data) ?? (orderRes.data is Map ? Map<String, dynamic>.from(orderRes.data as Map) : null);
        } catch (_) {
          final listRes = await _safeGet(ApiEndpoints.orders, query: {'page': 1, 'limit': 50});
          final data = _unwrap(listRes?.data);
          if (data != null && data['items'] is List) {
            for (final e in data['items'] as List) {
              final m = Map<String, dynamic>.from(e as Map);
              if (m['id']?.toString() == oid || m['orderNumber']?.toString() == oid) {
                order = m;
                break;
              }
            }
          }
        }
      }

      final recRes = await _safeGet(ApiEndpoints.recordings, query: {'page': 1, 'limit': 50, 'sortBy': 'createdAt', 'sortOrder': 'desc'});
      List items = [];
      final rd = _unwrap(recRes?.data);
      if (rd != null) {
        if (rd['items'] is List) {
          items = rd['items'] as List;
        } else if (rd['data'] is List) { items = rd['data'] as List; }
      } else if (recRes?.data is List) {
        items = recRes!.data as List;
      }

      recordings = items.map<Map<String, dynamic>>((e) {
        final m = Map<String, dynamic>.from(e as Map);
        return {
          'id': m['id']?.toString() ?? '',
          'orderId': m['orderId']?.toString() ?? '',
          'status': (m['status'] ?? 'CREATED').toString().toUpperCase(),
          'duration': m['durationSeconds'] ?? m['duration'] ?? 0,
          'fileUrl': m['fileUrl']?.toString(),
          'createdAt': m['createdAt']?.toString(),
        };
      }).toList();

      if (order != null) {
        final oid2 = order!['id']?.toString();
        final match = recordings.where((r) => r['orderId'] == oid2).toList();
        if (match.isNotEmpty) {
          activeSession = match.first;
          final st = activeSession!['status'].toString().toUpperCase();
          isRecording = st == 'STARTED' || st == 'RESUMED' || st == 'RECORDING';
          if (isRecording && _startedAt == null) {
            _startedAt = DateTime.now();
            elapsedSeconds = (activeSession!['duration'] as num?)?.toInt() ?? 0;
            _tick();
          }
        }
      }

      setState(() => isLoading = false);

      if (widget.autostart && !_didAutostart && order != null && !isRecording) {
        _didAutostart = true;
        Future.delayed(const Duration(milliseconds: 500), () {
          if (mounted) { _startRecording(); }
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = e.toString();
      });
    }
  }

  Future<String> _resolveWarehouseId(String companyId, String? currentId) async {
    List<Map<String, dynamic>> warehouses = [];
    try {
      final res = await _dio.get(ApiEndpoints.warehouses, queryParameters: {'page': 1, 'limit': 50, 'companyId': companyId});
      final data = _unwrap(res.data);
      List items = [];
      if (data != null) {
        if (data['items'] is List) {
          items = data['items'] as List;
        } else if (data['data'] is List) { items = data['data'] as List; }
      } else if (res.data is List) {
        items = res.data as List;
      }
      warehouses = items.map((e) => Map<String, dynamic>.from(e as Map)).toList();
    } catch (_) {}

    if (warehouses.isEmpty) { throw Exception('No warehouses found'); }
    if (currentId != null && warehouses.any((w) => w['id']?.toString() == currentId)) { return currentId; }

    final fallback = warehouses.first['id']?.toString();
    final oid = order?['id']?.toString();
    if (oid != null) {
      try {
        await _dio.patch('${ApiEndpoints.orders}/$oid', data: {'warehouseId': fallback});
        order = {...?order, 'warehouseId': fallback};
      } catch (_) {}
    }
    return fallback!;
  }

  Future<void> _startRecording() async {
    if (order == null) {
      _toast('No order loaded', error: true);
      return;
    }
    setState(() => isActionLoading = true);
    try {
      final companyId = order!['companyId']?.toString() ?? profile?['companyId']?.toString();
      var warehouseId = order!['warehouseId']?.toString();
      final orderId = order!['id']?.toString();
      final operatorId = profile?['id']?.toString();

      if (operatorId == null || operatorId.isEmpty) { throw Exception('Operator missing. Please re-login.'); }
      if (companyId == null || orderId == null) { throw Exception('Missing company or order id'); }

      warehouseId = await _resolveWarehouseId(companyId, warehouseId);

      final createRes = await _dio.post(
        ApiEndpoints.recordings,
        data: {
          'companyId': companyId,
          'warehouseId': warehouseId,
          'orderId': orderId,
          'operatorId': operatorId,
          'originalFileName': 'pack_${order!['orderNumber'] ?? orderId}_${DateTime.now().millisecondsSinceEpoch}.mp4',
        },
      );

      final session = _unwrap(createRes.data) ?? (createRes.data is Map ? Map<String, dynamic>.from(createRes.data as Map) : null);
      if (session == null || session['id'] == null) { throw Exception('Create recording returned no id'); }

      final sessionId = session['id'].toString();
      await _dio.post('${ApiEndpoints.recordings}/$sessionId/start');
      await _startCameraRecording();

      setState(() {
        activeSession = {'id': sessionId, 'orderId': orderId, 'status': 'STARTED', 'duration': 0};
        isRecording = true;
        elapsedSeconds = 0;
        _startedAt = DateTime.now();
        isActionLoading = false;
        _lastVideoFile = null;
      });

      _tick();
      _toast('Recording started');
      await _load();
    } catch (e) {
      setState(() => isActionLoading = false);
      _toast(_err(e), error: true);
    }
  }

  Future<void> _stopRecording() async {
    final id = activeSession?['id']?.toString();
    if (id == null) { return; }
    setState(() => isActionLoading = true);
    try {
      final videoFile = await _stopCameraRecording();
      _lastVideoFile = videoFile;
      await _dio.post('${ApiEndpoints.recordings}/$id/stop');

      setState(() {
        isRecording = false;
        activeSession = {...?activeSession, 'status': 'STOPPED', 'duration': elapsedSeconds};
        isActionLoading = false;
        _startedAt = null;
      });

      if (videoFile != null) {
        _toast('Recording stopped. Video saved: ${path.basename(videoFile.path)}');
      } else {
        _toast('Recording stopped (${_fmtDuration(elapsedSeconds)})');
      }
      await _load();
    } catch (e) {
      setState(() => isActionLoading = false);
      _toast(_err(e), error: true);
    }
  }

  Future<void> _markCompleted() async {
    final id = activeSession?['id']?.toString();
    if (id == null) { return; }
    setState(() => isActionLoading = true);
    try {
      try {
        await _dio.post('${ApiEndpoints.recordings}/$id/complete');
      } catch (_) {
        await _dio.patch('${ApiEndpoints.recordings}/$id', data: {'status': 'COMPLETED'});
      }
      setState(() {
        activeSession = {...?activeSession, 'status': 'COMPLETED'};
        isActionLoading = false;
      });
      _toast('Marked as Completed');
      await _load();
    } catch (e) {
      setState(() => isActionLoading = false);
      _toast(_err(e), error: true);
    }
  }

  
  void _startLiveClock() {
    _clockTimer?.cancel();
    _liveClock = DateTime.now();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() => _liveClock = DateTime.now());
    });
  }

  String _fmtProofTimestamp(DateTime dt) {
    final d = dt.day.toString().padLeft(2, '0');
    final m = dt.month.toString().padLeft(2, '0');
    final y = dt.year.toString();
    final h = dt.hour.toString().padLeft(2, '0');
    final min = dt.minute.toString().padLeft(2, '0');
    final s = dt.second.toString().padLeft(2, '0');
    return '$d/$m/$y $h:$min:$s';
  }
  void _tick() {
    if (!isRecording || _startedAt == null) { return; }
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted || !isRecording) { return; }
      setState(() {
        elapsedSeconds = DateTime.now().difference(_startedAt!).inSeconds;
      });
      _tick();
    });
  }

  String _err(Object e) {
    if (e is DioException) {
      final d = e.response?.data;
      if (d is Map) { return (d['message'] ?? d['error'] ?? e.message ?? 'Request failed').toString(); }
      return e.message ?? 'Request failed';
    }
    return e.toString().replaceFirst('Exception: ', '');
  }

  void _toast(String msg, {bool error = false}) {
    if (!mounted) { return; }
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg), backgroundColor: error ? Colors.red.shade700 : Colors.green.shade700, behavior: SnackBarBehavior.floating, duration: Duration(seconds: error ? 5 : 3)));
  }

  String _fmtDuration(int secs) {
    final m = (secs ~/ 60).toString().padLeft(2, '0');
    final s = (secs % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  String _fmtDate(dynamic raw) {
    if (raw == null) { return '—'; }
    try {
      final dt = DateTime.parse(raw.toString()).toLocal();
      return '${dt.day}/${dt.month} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return raw.toString();
    }
  }

  Color _statusColor(String status) {
    final s = status.toUpperCase();
    if (s.contains('START') || s.contains('RECORD')) { return Colors.red; }
    if (s.contains('STOP')) { return Colors.orange; }
    if (s.contains('COMPLETE') || s.contains('UPLOAD')) { return Colors.green; }
    return Colors.blueGrey;
  }

  String get _operatorLabel {
    if (profile == null) { return 'Not logged in'; }
    final name = [profile!['firstName'], profile!['lastName']].where((e) => e != null && e.toString().isNotEmpty).join(' ');
    if (name.isNotEmpty) { return name; }
    return profile!['email']?.toString() ?? profile!['id']?.toString() ?? '—';
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isMobile = screenWidth < 800;
    final wide = screenWidth > 1000;

    return AppLayout(
      title: 'Recordings',
      showBackButton: true,
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
                  padding: EdgeInsets.all(isMobile ? 14 : 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header Actions
                      if (isMobile)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: [
                                if (!_cameraReady && !kIsWeb)
                                  OutlinedButton.icon(
                                    onPressed: _initCamera,
                                    icon: const Icon(Icons.videocam, size: 16),
                                    label: const Text('Retry Camera'),
                                  ),
                                OutlinedButton.icon(
                                  onPressed: _load,
                                  icon: const Icon(Icons.refresh, size: 16),
                                  label: const Text('Refresh'),
                                ),
                              ],
                            ),
                          ],
                        )
                      else
                        Row(
                          children: [
                            const Spacer(),
                            if (!_cameraReady && !kIsWeb)
                              TextButton.icon(
                                onPressed: _initCamera,
                                icon: const Icon(Icons.videocam, size: 16),
                                label: const Text('Retry Camera'),
                              ),
                            OutlinedButton.icon(
                              onPressed: _load,
                              icon: const Icon(Icons.refresh, size: 16),
                              label: const Text('Refresh'),
                            ),
                          ],
                        ),
                      const SizedBox(height: 16),

                      // Main Content Area
                      if (wide)
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              flex: 6,
                              child: Column(
                                children: [
                                  _playerCard(isMobile),
                                  const SizedBox(height: 16),
                                  _allRecordingsCard(),
                                ],
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(flex: 4, child: _detailsCard(isMobile)),
                          ],
                        )
                      else
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            _playerCard(isMobile),
                            const SizedBox(height: 16),
                            _detailsCard(isMobile),
                            const SizedBox(height: 16),
                            _allRecordingsCard(),
                          ],
                        ),
                    ],
                  ),
                ),
    );
  }

  Widget _playerCard(bool isMobile) {
    final status = (activeSession?['status'] ?? 'NONE').toString().toUpperCase();
    final isStopped = status.contains('STOP');
    final isCompleted = status.contains('COMPLETE') || status.contains('UPLOAD');

    return Container(
      padding: EdgeInsets.all(isMobile ? 14 : 18),
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
              Flexible(
                child: Text(
                  'Live Camera + Recording',
                  style: TextStyle(
                    fontSize: isMobile ? 15 : 16,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF1E2329),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              if (isRecording)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(20)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle)),
                      const SizedBox(width: 6),
                      Text('REC  ${_fmtDuration(elapsedSeconds)}', style: TextStyle(color: Colors.red.shade700, fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 14),

          AspectRatio(
            aspectRatio: isMobile ? 4 / 3 : 16 / 9,
            child: Container(
              decoration: BoxDecoration(color: const Color(0xFF0B1220), borderRadius: BorderRadius.circular(12)),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (_cameraReady && _cameraController != null)
                    CameraPreview(_cameraController!)
                  else
                    Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (_isInitializingCamera)
                            const CircularProgressIndicator(color: Colors.white54)
                          else
                            Icon(isCompleted ? Icons.check_circle_outline : Icons.videocam_off, size: 56, color: Colors.white24),
                          const SizedBox(height: 12),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: Text(
                              _cameraError ?? (kIsWeb ? 'Web: Camera recording limited. Use mobile/tablet.' : 'Camera not ready'),
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: Colors.white54, fontSize: 12),
                            ),
                          ),
                        ],
                      ),
                    ),
                                    // CCTV-style live proof timestamp (always visible when camera ready)
                  if (_cameraReady)
                    Positioned(
                      top: 10,
                      right: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.72),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: Colors.white24, width: 0.5),
                        ),
                        child: Text(
                          _fmtProofTimestamp(_liveClock),
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                            fontFamily: 'monospace',
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ),
                  // REC badge top-left while recording
                  if (isRecording)
                    Positioned(
                      top: 10,
                      left: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(4)),
                        child: Text(
                          '● REC  ${_fmtDuration(elapsedSeconds)}',
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                        ),
                      ),
                    ),
                  // Order ID bottom-left for stronger evidence link
                  if (_cameraReady && order != null)
                    Positioned(
                      bottom: 36,
                      left: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.65),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          'ORD: ${order?['orderNumber'] ?? order?['id'] ?? '—'}',
                          style: const TextStyle(color: Colors.white70, fontSize: 11, fontFamily: 'monospace'),
                        ),
                      ),
                    ),
                  Positioned(
                    bottom: 12, left: 12, right: 12,
                    child: Text(
                      isRecording ? 'Recording in progress' : isCompleted ? 'Recording completed' : isStopped ? 'Stopped — Mark Completed' : _cameraReady ? 'Camera ready — press Start' : 'Initializing...',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),

          if (isMobile)
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (!isRecording) ...[
                  FilledButton.icon(
                    onPressed: isActionLoading ? null : _startRecording,
                    icon: const Icon(Icons.fiber_manual_record, size: 18),
                    label: Text(isActionLoading ? 'Starting…' : 'Start Recording'),
                    style: FilledButton.styleFrom(backgroundColor: Colors.red.shade600, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                  ),
                  if (isStopped && !isCompleted) ...[
                    const SizedBox(height: 10),
                    OutlinedButton.icon(
                      onPressed: isActionLoading ? null : _markCompleted,
                      icon: const Icon(Icons.check_circle_outline, size: 18),
                      label: const Text('Mark Completed'),
                      style: OutlinedButton.styleFrom(foregroundColor: Colors.green.shade700, side: BorderSide(color: Colors.green.shade300), padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                    ),
                  ],
                ] else ...[
                  FilledButton.icon(
                    onPressed: isActionLoading ? null : _stopRecording,
                    icon: const Icon(Icons.stop, size: 18),
                    label: Text(isActionLoading ? 'Stopping…' : 'Stop Recording'),
                    style: FilledButton.styleFrom(backgroundColor: const Color(0xFF1E2329), padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                  ),
                ],
                const SizedBox(height: 10),
                OutlinedButton.icon(
                  onPressed: () => context.go('/scanning'),
                  icon: const Icon(Icons.qr_code_scanner, size: 16),
                  label: const Text('Scan next'),
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
                ),
              ],
            )
          else
            Row(
              children: [
                if (!isRecording) ...[
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: isActionLoading ? null : _startRecording,
                      icon: const Icon(Icons.fiber_manual_record, size: 18),
                      label: Text(isActionLoading ? 'Starting…' : 'Start Recording'),
                      style: FilledButton.styleFrom(backgroundColor: Colors.red.shade600, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                    ),
                  ),
                  if (isStopped && !isCompleted) ...[
                    const SizedBox(width: 10),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: isActionLoading ? null : _markCompleted,
                        icon: const Icon(Icons.check_circle_outline, size: 18),
                        label: const Text('Mark Completed'),
                        style: OutlinedButton.styleFrom(foregroundColor: Colors.green.shade700, side: BorderSide(color: Colors.green.shade300), padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                      ),
                    ),
                  ],
                ] else ...[
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: isActionLoading ? null : _stopRecording,
                      icon: const Icon(Icons.stop, size: 18),
                      label: Text(isActionLoading ? 'Stopping…' : 'Stop Recording'),
                      style: FilledButton.styleFrom(backgroundColor: const Color(0xFF1E2329), padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                    ),
                  ),
                ],
                const SizedBox(width: 10),
                OutlinedButton.icon(
                  onPressed: () => context.go('/scanning'),
                  icon: const Icon(Icons.qr_code_scanner, size: 16),
                  label: const Text('Scan next'),
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14)),
                ),
              ],
            ),

          if (_lastVideoFile != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.green.shade200)),
              child: Row(
                children: [
                  Icon(Icons.video_file, color: Colors.green.shade700, size: 20),
                  const SizedBox(width: 10),
                  Expanded(child: Text('Saved: ${path.basename(_lastVideoFile!.path)}', style: TextStyle(fontSize: 12, color: Colors.green.shade800))),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _detailsCard(bool isMobile) {
    final o = order;
    final status = (activeSession?['status'] ?? 'None').toString();

    return Container(
      padding: EdgeInsets.all(isMobile ? 14 : 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Recording Details', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1E2329))),
          const SizedBox(height: 16),
          if (o == null)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Column(
                children: [
                  Text('No order linked. Scan an order first.', style: TextStyle(color: Colors.grey.shade600, fontSize: 13), textAlign: TextAlign.center),
                  const SizedBox(height: 12),
                  FilledButton(onPressed: () => context.go('/scanning'), child: const Text('Go to Scanning')),
                ],
              ),
            )
          else ...[
            _row('Order ID', (o['orderNumber'] ?? o['id'] ?? '—').toString(), isMobile),
            _row('Customer', (o['customerName'] ?? '—').toString(), isMobile),
            _row('Status', (o['status'] ?? '—').toString(), isMobile),
            _row('Marketplace', (o['marketplace'] ?? '—').toString(), isMobile),
            _row('AWB', (o['awbNumber'] ?? o['trackingNumber'] ?? '—').toString(), isMobile),
            const Divider(height: 28),
            _row('Session', activeSession?['id'] != null ? activeSession!['id'].toString().substring(0, 8) : '—', isMobile),
            _row('Session status', status, isMobile),
            _row('Duration', isRecording ? _fmtDuration(elapsedSeconds) : _fmtDuration((activeSession?['duration'] as num?)?.toInt() ?? 0), isMobile),
            _row('Operator', _operatorLabel, isMobile),
            _row('Camera', _cameraReady ? 'Ready' : (_cameraError ?? 'Not ready'), isMobile),
          ],
        ],
      ),
    );
  }

  Widget _row(String label, String value, bool isMobile) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: isMobile ? 100 : 120, child: Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade500))),
          Expanded(child: Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF1E2329)))),
        ],
      ),
    );
  }

  Widget _allRecordingsCard() {
    return Container(
      padding: const EdgeInsets.all(18),
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('All Recordings', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1E2329))),
          const SizedBox(height: 12),
          if (recordings.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Center(child: Text('No recording sessions yet', style: TextStyle(color: Colors.grey.shade500, fontSize: 13))),
            )
          else
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                headingRowColor: WidgetStateProperty.all(Colors.grey.shade50),
                columns: const [
                  DataColumn(label: Text('Session', style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text('Order', style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text('Status', style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text('Duration', style: TextStyle(fontWeight: FontWeight.bold))),
                  DataColumn(label: Text('Created', style: TextStyle(fontWeight: FontWeight.bold))),
                ],
                rows: recordings.take(15).map((r) {
                  final st = r['status'].toString();
                  final color = _statusColor(st);
                  return DataRow(cells: [
                    DataCell(Text(r['id'].toString().length > 8 ? r['id'].toString().substring(0, 8) : r['id'].toString())),
                    DataCell(Text(r['orderId'].toString().length > 8 ? r['orderId'].toString().substring(0, 8) : r['orderId'].toString())),
                    DataCell(Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6)),
                      child: Text(st, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
                    )),
                    DataCell(Text(_fmtDuration((r['duration'] as num?)?.toInt() ?? 0))),
                    DataCell(Text(_fmtDate(r['createdAt']), style: TextStyle(fontSize: 12, color: Colors.grey.shade600))),
                  ]);
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }
}










