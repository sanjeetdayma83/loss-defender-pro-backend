import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_theme.dart';

class ReturnsScreen extends StatefulWidget {
  const ReturnsScreen({super.key});

  @override
  State<ReturnsScreen> createState() => _ReturnsScreenState();
}

class _ReturnsScreenState extends State<ReturnsScreen> {
  List<dynamic> _list = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await ApiClient.instance.dio.get('/returns');
      final body = res.data;
      final data = body is Map && body['data'] != null ? body['data'] : body;
      setState(() => _list = data is List ? data : []);
    } on DioException catch (e) {
      setState(() => _error = e.message ?? 'Failed to load');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Color _statusColor(String? s) {
    switch (s) {
      case 'refunded':
      case 'restocked':
      case 'closed':
        return AppColors.success;
      case 'requested':
      case 'received':
      case 'inspecting':
        return AppColors.warning;
      case 'rejected':
        return AppColors.danger;
      default:
        return AppColors.textSecondary;
    }
  }

  Future<void> _createReturn() async {
    List<dynamic> orders = [];
    try {
      final res = await ApiClient.instance.dio.get('/orders');
      final body = res.data;
      final data = body is Map && body['data'] != null ? body['data'] : body;
      orders = data is List ? data : [];
    } catch (_) {}

    if (!mounted || orders.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No orders available')));
      return;
    }

    String? orderId = (orders.first as Map)['id']?.toString();
    final reasonCtrl = TextEditingController();

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(builder: (ctx, setLocal) {
          return AlertDialog(
            title: const Text('New Return'),
            content: SizedBox(
              width: 400,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  DropdownButtonFormField<String>(
                    value: orderId,
                    decoration: const InputDecoration(
                        labelText: 'Order *', border: OutlineInputBorder()),
                    items: orders.map((o) {
                      final m = o as Map<String, dynamic>;
                      final label =
                          m['marketplaceOrderId']?.toString() ?? m['id']?.toString() ?? '—';
                      return DropdownMenuItem(value: m['id']?.toString(), child: Text(label));
                    }).toList(),
                    onChanged: (v) => setLocal(() => orderId = v),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: reasonCtrl,
                    decoration: const InputDecoration(
                        labelText: 'Reason', border: OutlineInputBorder()),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
              FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Create')),
            ],
          );
        });
      },
    );

    if (ok != true || orderId == null) return;
    try {
      await ApiClient.instance.dio.post('/returns', data: {
        'orderId': orderId,
        if (reasonCtrl.text.trim().isNotEmpty) 'reason': reasonCtrl.text.trim(),
      });
      _load();
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(e.message ?? 'Create failed')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 700;
    final open = _list
        .where((e) =>
            ['requested', 'received', 'inspecting'].contains((e as Map)['status']))
        .length;
    final closed = _list
        .where((e) =>
            ['refunded', 'restocked', 'rejected', 'closed'].contains((e as Map)['status']))
        .length;

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
                    Text('Returns Management',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                    SizedBox(height: 2),
                    Text('Track and investigate returned shipments with evidence',
                        style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  ],
                ),
              ),
              IconButton(icon: const Icon(Icons.refresh, size: 20), onPressed: _load),
              const SizedBox(width: 4),
              FilledButton.icon(
                onPressed: _createReturn,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('New Return'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isWide ? 24 : 16),
          child: LayoutBuilder(builder: (context, c) {
            final cross = c.maxWidth > 600 ? 3 : 1;
            return GridView.count(
              crossAxisCount: cross,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 2.2,
              children: [
                _Kpi('Open Returns', '$open', Icons.assignment_return, AppColors.warning),
                _Kpi('Closed', '$closed', Icons.check_circle_outline, AppColors.success),
                _Kpi('Total', '${_list.length}', Icons.list_alt, AppColors.info),
              ],
            );
          }),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.danger)))
                  : _list.isEmpty
                      ? const Center(child: Text('No returns yet'))
                      : ListView.separated(
                          padding: EdgeInsets.all(isWide ? 24 : 16),
                          itemCount: _list.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (context, i) {
                            final r = _list[i] as Map<String, dynamic>;
                            final status = r['status']?.toString() ?? '';
                            final order = r['order'];
                            final ref = order is Map
                                ? (order['marketplaceOrderId'] ?? order['id'])?.toString()
                                : r['orderId']?.toString();
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.assignment_return, color: _statusColor(status)),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(ref ?? '—',
                                            style: const TextStyle(
                                                fontWeight: FontWeight.w600, fontSize: 14)),
                                        Text(r['reason']?.toString() ?? '—',
                                            style: const TextStyle(
                                                fontSize: 12, color: AppColors.textSecondary)),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _statusColor(status),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(status,
                                        style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600)),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
        ),
      ],
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
      padding: const EdgeInsets.all(16),
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
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(i, color: c, size: 20),
          ),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(v, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
              Text(t, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            ],
          ),
        ],
      ),
    );
  }
}