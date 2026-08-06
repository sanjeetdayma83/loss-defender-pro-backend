import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_theme.dart';
import 'recording_session_page.dart';

class RecordingScreen extends StatefulWidget {
  const RecordingScreen({super.key});

  @override
  State<RecordingScreen> createState() => _RecordingScreenState();
}

class _RecordingScreenState extends State<RecordingScreen> {
  List<dynamic> _list = [];
  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _selected;
  final _searchCtrl = TextEditingController();
  String _q = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<dynamic> _asList(dynamic body) {
    if (body is Map && body['data'] is List) return body['data'] as List;
    if (body is List) return body;
    return [];
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await ApiClient.instance.dio.get('/recordings');
      final list = _asList(res.data);
      setState(() {
        _list = list;
        _loading = false;
        if (_selected == null && list.isNotEmpty && list.first is Map) {
          _selected = Map<String, dynamic>.from(list.first as Map);
        }
      });
    } on DioException catch (e) {
      setState(() {
        _error = e.message ?? 'Failed to load';
        _loading = false;
      });
    }
  }

  List<dynamic> get _filtered {
    if (_q.isEmpty) return _list;
    final q = _q.toLowerCase();
    return _list.where((r) {
      if (r is! Map) return false;
      final s = '${r['id']} ${r['orderId']} ${r['status']} ${r['operator']}'.toLowerCase();
      return s.contains(q);
    }).toList();
  }

  int get _totalDuration {
    var s = 0;
    for (final r in _list) {
      if (r is Map && r['durationSec'] is num) s += (r['durationSec'] as num).toInt();
    }
    return s;
  }

  String _fmtDur(int sec) {
    final h = sec ~/ 3600;
    final m = (sec % 3600) ~/ 60;
    final s = sec % 60;
    if (h > 0) return '${h}h ${m}m';
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  String _fmtDate(String? iso) {
    if (iso == null) return '—';
    try {
      final d = DateTime.parse(iso).toLocal();
      return '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')} ${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return iso;
    }
  }

  Color _stColor(String s) {
    switch (s) {
      case 'completed':
      case 'processed':
        return const Color(0xFF22C55E);
      case 'started':
      case 'paused':
        return const Color(0xFFF59E0B);
      case 'failed':
        return const Color(0xFFEF4444);
      default:
        return const Color(0xFF3B82F6);
    }
  }

  Future<void> _startSession() async {
    List<dynamic> orders = [];
    List<dynamic> warehouses = [];
    try {
      final o = await ApiClient.instance.dio.get('/orders');
      orders = _asList(o.data);
      final w = await ApiClient.instance.dio.get('/warehouses');
      warehouses = _asList(w.data);
    } catch (_) {}
    if (!mounted) return;
    if (orders.isEmpty || warehouses.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Need at least 1 order and 1 warehouse')),
      );
      return;
    }
    String? orderId = (orders.first as Map)['id']?.toString();
    String? warehouseId = (warehouses.first as Map)['id']?.toString();

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setLocal) => AlertDialog(
          title: const Text('Start Recording'),
          content: SizedBox(
            width: 400,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: orderId,
                  decoration: const InputDecoration(
                      labelText: 'Order', border: OutlineInputBorder()),
                  items: [
                    for (final o in orders)
                      if (o is Map)
                        DropdownMenuItem(
                          value: o['id']?.toString(),
                          child: Text(o['marketplaceOrderId']?.toString() ??
                              o['id']?.toString() ??
                              '—'),
                        ),
                  ],
                  onChanged: (v) => setLocal(() => orderId = v),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: warehouseId,
                  decoration: const InputDecoration(
                      labelText: 'Warehouse', border: OutlineInputBorder()),
                  items: [
                    for (final w in warehouses)
                      if (w is Map)
                        DropdownMenuItem(
                          value: w['id']?.toString(),
                          child: Text(w['name']?.toString() ?? '—'),
                        ),
                  ],
                  onChanged: (v) => setLocal(() => warehouseId = v),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
            FilledButton(
              onPressed: orderId == null || warehouseId == null
                  ? null
                  : () => Navigator.pop(ctx, true),
              child: const Text('Open Camera'),
            ),
          ],
        ),
      ),
    );
    if (ok != true || !mounted || orderId == null || warehouseId == null) return;
    final result = await Navigator.push<bool>(
      context,
      MaterialPageRoute(
        builder: (_) => RecordingSessionPage(
          orderId: orderId!,
          warehouseId: warehouseId!,
        ),
      ),
    );
    if (result == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 1100;
    final filtered = _filtered;
    final completed = _list.where((r) =>
        r is Map && ['completed', 'processed'].contains(r['status'])).length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: EdgeInsets.fromLTRB(isWide ? 24 : 16, 16, isWide ? 24 : 16, 0),
          child: Row(
            children: [
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Recordings',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
                    SizedBox(height: 4),
                    Text('Review recorded sessions, timeline events, and evidence.',
                        style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  ],
                ),
              ),
              IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
              const SizedBox(width: 8),
              FilledButton.icon(
                onPressed: _startSession,
                icon: const Icon(Icons.videocam, size: 18),
                label: const Text('Start Session'),
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF2563EB)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isWide ? 24 : 16),
          child: LayoutBuilder(builder: (context, c) {
            final cross = c.maxWidth > 900 ? 4 : 2;
            return GridView.count(
              crossAxisCount: cross,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 2.4,
              children: [
                _Kpi('Total Recordings', '${_list.length}', Icons.videocam, const Color(0xFF3B82F6)),
                _Kpi('Total Duration', _fmtDur(_totalDuration), Icons.timer, const Color(0xFFF59E0B)),
                _Kpi('Completed', '$completed', Icons.check_circle, const Color(0xFF22C55E)),
                _Kpi('In progress', '${_list.length - completed}', Icons.circle, const Color(0xFF8B5CF6)),
              ],
            );
          }),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isWide ? 24 : 16),
          child: TextField(
            controller: _searchCtrl,
            onChanged: (v) => setState(() => _q = v),
            decoration: InputDecoration(
              hintText: 'Search recordings…',
              prefixIcon: const Icon(Icons.search, size: 20),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.border),
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.danger)))
                  : isWide
                      ? Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Expanded(flex: 3, child: _listPane(filtered)),
                            SizedBox(width: 300, child: _detailPane()),
                          ],
                        )
                      : _listPane(filtered),
        ),
      ],
    );
  }

  Widget _listPane(List<dynamic> filtered) {
    if (filtered.isEmpty) {
      return const Center(child: Text('No recordings yet — start a session'));
    }
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(24, 0, 16, 24),
      itemCount: filtered.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) {
        final r = filtered[i] as Map<String, dynamic>;
        final status = r['status']?.toString() ?? '';
        final op = r['operator'];
        final opName = op is Map ? op['name']?.toString() : null;
        final sel = _selected?['id'] == r['id'];
        final sc = _stColor(status);
        return InkWell(
          onTap: () => setState(() => _selected = r),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: sel ? const Color(0xFFEFF6FF) : Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                  color: sel ? const Color(0xFF2563EB) : AppColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: sc.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(Icons.videocam, color: sc, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'REC-${(r['id']?.toString() ?? '----').substring(0, 4).toUpperCase()}',
                        style: const TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 13),
                      ),
                      Text(
                        'Order ${r['orderId']?.toString().substring(0, (r['orderId']?.toString().length ?? 0).clamp(0, 8)) ?? '—'}…'
                        '${opName != null ? ' · $opName' : ''}',
                        style: const TextStyle(
                            fontSize: 11, color: AppColors.textSecondary),
                      ),
                    ],
                  ),
                ),
                Text(
                  r['durationSec'] != null
                      ? _fmtDur((r['durationSec'] as num).toInt())
                      : '—',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
                const SizedBox(width: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: sc.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(status,
                      style: TextStyle(
                          fontSize: 10, fontWeight: FontWeight.w700, color: sc)),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _detailPane() {
    final r = _selected;
    if (r == null) {
      return Container(
        margin: const EdgeInsets.only(right: 24, bottom: 24),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: const Center(
          child: Text('Select a recording',
              style: TextStyle(color: AppColors.textSecondary)),
        ),
      );
    }
    final status = r['status']?.toString() ?? '';
    final op = r['operator'];
    final opName = op is Map ? op['name']?.toString() : '—';
    final ev = r['evidence'];
    final evStatus = ev is Map ? ev['status']?.toString() : null;

    return Container(
      margin: const EdgeInsets.only(right: 24, bottom: 24),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: ListView(
        children: [
          Row(
            children: [
              const Expanded(
                child: Text('Recording Details',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: _stColor(status).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(status,
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: _stColor(status))),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _row('Recording ID', r['id']?.toString() ?? '—'),
          _row('Order ID', r['orderId']?.toString() ?? '—'),
          _row('Operator', opName ?? '—'),
          _row('Warehouse', r['warehouseId']?.toString() ?? '—'),
          _row('Started', _fmtDate(r['startedAt']?.toString())),
          _row('Completed', _fmtDate(r['completedAt']?.toString())),
          _row(
              'Duration',
              r['durationSec'] != null
                  ? _fmtDur((r['durationSec'] as num).toInt())
                  : '—'),
          _row('Segments', '${r['segmentCount'] ?? 0}'),
          if (evStatus != null) _row('Evidence', evStatus),
          const SizedBox(height: 16),
          if (status == 'started' || status == 'paused')
            FilledButton.icon(
              onPressed: () async {
                try {
                  await ApiClient.instance.dio
                      .post('/recordings/${r['id']}/stop');
                  _load();
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context)
                        .showSnackBar(SnackBar(content: Text('$e')));
                  }
                }
              },
              icon: const Icon(Icons.stop),
              label: const Text('Stop Recording'),
              style: FilledButton.styleFrom(backgroundColor: Colors.red),
            ),
        ],
      ),
    );
  }

  Widget _row(String k, String v) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(k,
                style: const TextStyle(
                    fontSize: 12, color: AppColors.textSecondary)),
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
}

class _Kpi extends StatelessWidget {
  final String t, v;
  final IconData i;
  final Color c;
  const _Kpi(this.t, this.v, this.i, this.c);
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: c.withOpacity(0.12),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(i, color: c, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(v,
                    style: const TextStyle(
                        fontSize: 18, fontWeight: FontWeight.w800)),
                Text(t,
                    style: const TextStyle(
                        fontSize: 11, color: AppColors.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}