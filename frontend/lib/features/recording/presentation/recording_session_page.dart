import 'dart:io';
import 'package:camera/camera.dart';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_theme.dart';

class RecordingSessionPage extends StatefulWidget {
  final String orderId;
  final String? warehouseId;
  final String? stationId;

  const RecordingSessionPage({
    super.key,
    required this.orderId,
    this.warehouseId,
    this.stationId,
  });

  @override
  State<RecordingSessionPage> createState() => _RecordingSessionPageState();
}

class _RecordingSessionPageState extends State<RecordingSessionPage> {
  CameraController? _cam;
  bool _ready = false;
  bool _recording = false;
  bool _uploading = false;
  String? _recordingId;
  String? _error;
  Duration _elapsed = Duration.zero;
  DateTime? _startedAt;

  @override
  void initState() {
    super.initState();
    _initCamera();
  }

  Future<void> _initCamera() async {
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        setState(() => _error = 'No camera found');
        return;
      }
      final cam = cameras.firstWhere(
        (c) => c.lensDirection == CameraLensDirection.back,
        orElse: () => cameras.first,
      );
      _cam = CameraController(cam, ResolutionPreset.high, enableAudio: true);
      await _cam!.initialize();
      if (mounted) setState(() => _ready = true);
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  Future<void> _start() async {
    if (_cam == null || !_cam!.value.isInitialized) return;
    try {
      final res = await ApiClient.instance.dio.post('/recordings/start', data: {
        'orderId': widget.orderId,
        if (widget.warehouseId != null) 'warehouseId': widget.warehouseId,
        if (widget.stationId != null) 'stationId': widget.stationId,
      });
      final body = res.data;
      final data = body is Map && body['data'] != null ? body['data'] : body;
      _recordingId = data is Map ? data['id']?.toString() : null;

      await _cam!.startVideoRecording();
      _startedAt = DateTime.now();
      setState(() {
        _recording = true;
        _elapsed = Duration.zero;
      });
      _tick();
    } on DioException catch (e) {
      setState(() => _error = e.response?.data?.toString() ?? e.message ?? 'Start failed');
    } catch (e) {
      setState(() => _error = e.toString());
    }
  }

  void _tick() {
    if (!_recording || _startedAt == null) return;
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted || !_recording) return;
      setState(() => _elapsed = DateTime.now().difference(_startedAt!));
      _tick();
    });
  }

  Future<void> _stop() async {
    if (_cam == null || !_recording) return;
    setState(() => _uploading = true);
    try {
      final file = await _cam!.stopVideoRecording();
      setState(() => _recording = false);

      if (_recordingId != null && !kIsWeb) {
        await _uploadSegment(file);
        await ApiClient.instance.dio.post('/recordings/$_recordingId/stop');
      } else if (_recordingId != null) {
        // Web: skip binary upload for now, just stop
        await ApiClient.instance.dio.post('/recordings/$_recordingId/stop');
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Recording saved & uploaded')),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _uploading = false;
      });
    }
  }

  Future<void> _uploadSegment(XFile file) async {
    final key = 'recordings/$_recordingId/seg-0.mp4';
    // 1) Presign — adjust path if your StorageModule differs
    final presign = await ApiClient.instance.dio.post('/storage/presign', data: {
      'key': key,
      'contentType': 'video/mp4',
    });
    final pBody = presign.data;
    final pData = pBody is Map && pBody['data'] != null ? pBody['data'] : pBody;
    final uploadUrl = pData is Map ? (pData['url'] ?? pData['uploadUrl'])?.toString() : null;
    final b2Key = pData is Map ? (pData['key'] ?? key)?.toString() : key;

    if (uploadUrl == null) throw Exception('Presign failed — no URL');

    // 2) PUT to B2
    final bytes = await File(file.path).readAsBytes();
    await Dio().put(
      uploadUrl,
      data: bytes,
      options: Options(headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': bytes.length,
      }),
    );

    // 3) Register segment
    await ApiClient.instance.dio.post('/recordings/$_recordingId/segments', data: {
      'sequence': 0,
      'b2Key': b2Key,
      'sizeBytes': '${bytes.length}',
      'durationSec': _elapsed.inSeconds,
    });
  }

  @override
  void dispose() {
    _cam?.dispose();
    super.dispose();
  }

  String _fmt(Duration d) {
    final m = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    final h = d.inHours;
    return h > 0 ? '${h.toString().padLeft(2, '0')}:$m:$s' : '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: Text(_uploading
            ? 'Uploading…'
            : _recording
                ? 'REC ${_fmt(_elapsed)}'
                : 'Recording Session'),
        actions: [
          if (_recording)
            Container(
              margin: const EdgeInsets.only(right: 16),
              width: 12,
              height: 12,
              decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
            ),
        ],
      ),
      body: _error != null
          ? Center(child: Text(_error!, style: const TextStyle(color: Colors.white)))
          : !_ready
              ? const Center(child: CircularProgressIndicator(color: Colors.white))
              : Stack(
                  fit: StackFit.expand,
                  children: [
                    CameraPreview(_cam!),
                    if (_uploading)
                      Container(
                        color: Colors.black54,
                        child: const Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              CircularProgressIndicator(color: Colors.white),
                              SizedBox(height: 12),
                              Text('Uploading to storage…',
                                  style: TextStyle(color: Colors.white)),
                            ],
                          ),
                        ),
                      ),
                    Positioned(
                      left: 0,
                      right: 0,
                      bottom: 40,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (!_recording && !_uploading)
                            FloatingActionButton.extended(
                              onPressed: _start,
                              backgroundColor: AppColors.accent,
                              icon: const Icon(Icons.fiber_manual_record),
                              label: const Text('Start'),
                            )
                          else if (_recording)
                            FloatingActionButton(
                              onPressed: _stop,
                              backgroundColor: Colors.red,
                              child: const Icon(Icons.stop),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }
}