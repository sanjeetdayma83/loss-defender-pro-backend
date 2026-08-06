import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_theme.dart';

class EvidenceScreen extends StatefulWidget {
  const EvidenceScreen({super.key});

  @override
  State<EvidenceScreen> createState() => _EvidenceScreenState();
}

class _EvidenceScreenState extends State<EvidenceScreen> {
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
      final res = await ApiClient.instance.dio.get('/evidence');
      final list = _asList(res.data);
      setState(() {
        _list = list;
        _loading = false;
        if (list.isNotEmpty && list.first is Map) {
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
    return _list.where((e) {
      if (e is! Map) return false;
      return '${e['id']} ${e['orderId']} ${e['status']}'.toLowerCase().contains(q);
    }).toList();
  }

  Color _st(String s) {
    switch (s) {
      case 'ready':
        return const Color(0xFF22C55E);
      case 'pending':
        return const Color(0xFFF59E0B);
      case 'failed':
        return const Color(0xFFEF4444);
      default:
        return const Color(0xFF3B82F6);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 1000;
    final filtered = _filtered;
    final ready = _list.where((e) => e is Map && e['status'] == 'ready').length;
    final pending = _list.where((e) => e is Map && e['status'] == 'pending').length;

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
                    Text('Evidence',
                        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
                    SizedBox(height: 4),
                    Text('Search, review and manage warehouse evidence packs.',
                        style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  ],
                ),
              ),
              IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isWide ? 24 : 16),
          child: LayoutBuilder(builder: (context, c) {
            final cross = c.maxWidth > 800 ? 4 : 2;
            return GridView.count(
              crossAxisCount: cross,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 2.3,
              children: [
                _Kpi('Total Evidence', '${_list.length}', Icons.photo_library, const Color(0xFF3B82F6)),
                _Kpi('Ready', '$ready', Icons.verified, const Color(0xFF22C55E)),
                _Kpi('Pending', '$pending', Icons.hourglass_empty, const Color(0xFFF59E0B)),
                _Kpi('Failed', '${_list.length - ready - pending}', Icons.error_outline, const Color(0xFFEF4444)),
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
              hintText: 'Search by Order ID, status…',
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
                  : filtered.isEmpty
                      ? const Center(
                          child: Text(
                              'No evidence yet — appears after recording stop'))
                      : isWide
                          ? Row(
                              children: [
                                Expanded(flex: 3, child: _grid(filtered)),
                                SizedBox(width: 300, child: _detail()),
                              ],
                            )
                          : _grid(filtered),
        ),
      ],
    );
  }

  Widget _grid(List<dynamic> filtered) {
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(24, 0, 16, 24),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 280,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1.15,
      ),
      itemCount: filtered.length,
      itemBuilder: (context, i) {
        final e = filtered[i] as Map<String, dynamic>;
        final status = e['status']?.toString() ?? '';
        final order = e['order'];
        final ref = order is Map
            ? (order['marketplaceOrderId'] ?? order['id'])?.toString()
            : e['orderId']?.toString();
        final sc = _st(status);
        final sel = _selected?['id'] == e['id'];
        return InkWell(
          onTap: () => setState(() => _selected = e),
          borderRadius: BorderRadius.circular(14),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                  color: sel ? const Color(0xFF2563EB) : AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withOpacity(0.06),
                      borderRadius:
                          const BorderRadius.vertical(top: Radius.circular(14)),
                    ),
                    child: Stack(
                      children: [
                        const Center(
                          child: Icon(Icons.photo_library_outlined,
                              size: 40, color: Color(0xFF94A3B8)),
                        ),
                        Positioned(
                          top: 8,
                          right: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: sc.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(status,
                                style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: sc)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(ref ?? e['id']?.toString() ?? '—',
                          style: const TextStyle(
                              fontWeight: FontWeight.w700, fontSize: 12),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                      const SizedBox(height: 4),
                      Text('${e['frameCount'] ?? 0} frames',
                          style: const TextStyle(
                              fontSize: 11, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _detail() {
    final e = _selected;
    if (e == null) {
      return Container(
        margin: const EdgeInsets.only(right: 24, bottom: 24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: const Center(
            child: Text('Select evidence',
                style: TextStyle(color: AppColors.textSecondary))),
      );
    }
    final status = e['status']?.toString() ?? '';
    final order = e['order'];
    final rec = e['recording'];
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
                child: Text('Evidence Details',
                    style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: _st(status).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(status,
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: _st(status))),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _row('Evidence ID', e['id']?.toString() ?? '—'),
          _row(
              'Order',
              order is Map
                  ? (order['marketplaceOrderId'] ?? order['id'])?.toString() ??
                      '—'
                  : e['orderId']?.toString() ?? '—'),
          _row('Recording',
              rec is Map ? rec['id']?.toString() ?? '—' : e['recordingId']?.toString() ?? '—'),
          _row('Frames', '${e['frameCount'] ?? 0}'),
          _row('Checksum', e['checksum']?.toString() ?? '—'),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () {},
            icon: const Icon(Icons.download_outlined, size: 18),
            label: const Text('Download pack'),
          ),
        ],
      ),
    );
  }

  Widget _row(String k, String v) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 90,
              child: Text(k,
                  style: const TextStyle(
                      fontSize: 12, color: AppColors.textSecondary)),
            ),
            Expanded(
              child: Text(v,
                  style: const TextStyle(
                      fontSize: 12, fontWeight: FontWeight.w600)),
            ),
          ],
        ),
      );
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