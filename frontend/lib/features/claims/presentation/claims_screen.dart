import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_theme.dart';

class ClaimsScreen extends StatefulWidget {
  const ClaimsScreen({super.key});

  @override
  State<ClaimsScreen> createState() => _ClaimsScreenState();
}

class _ClaimsScreenState extends State<ClaimsScreen> {
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
      final res = await ApiClient.instance.dio.get('/claims');
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
      case 'approved':
      case 'closed':
        return AppColors.success;
      case 'open':
      case 'investigating':
        return AppColors.warning;
      case 'rejected':
        return AppColors.danger;
      case 'escalated':
        return AppColors.info;
      default:
        return AppColors.textSecondary;
    }
  }

  Future<void> _createClaim() async {
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
    final reasonCtrl = TextEditingController(text: 'missing_item');
    final descCtrl = TextEditingController();

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(builder: (ctx, setLocal) {
          return AlertDialog(
            title: const Text('New Claim'),
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
                        labelText: 'Reason *', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: descCtrl,
                    maxLines: 2,
                    decoration: const InputDecoration(
                        labelText: 'Description', border: OutlineInputBorder()),
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
      await ApiClient.instance.dio.post('/claims', data: {
        'orderId': orderId,
        'reason': reasonCtrl.text.trim(),
        if (descCtrl.text.trim().isNotEmpty) 'description': descCtrl.text.trim(),
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
    final open = _list.where((e) => ['open', 'investigating'].contains((e as Map)['status'])).length;

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
                    Text('Claims',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                    SizedBox(height: 2),
                    Text('Marketplace disputes and evidence-backed responses',
                        style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  ],
                ),
              ),
              IconButton(icon: const Icon(Icons.refresh, size: 20), onPressed: _load),
              const SizedBox(width: 4),
              FilledButton.icon(
                onPressed: _createClaim,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('New Claim'),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: EdgeInsets.symmetric(horizontal: isWide ? 24 : 16),
          child: Row(
            children: [
              _miniKpi('Total', '${_list.length}', AppColors.accent),
              const SizedBox(width: 12),
              _miniKpi('Open', '$open', AppColors.warning),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(child: Text(_error!, style: const TextStyle(color: AppColors.danger)))
                  : _list.isEmpty
                      ? const Center(child: Text('No claims yet'))
                      : ListView.separated(
                          padding: EdgeInsets.all(isWide ? 24 : 16),
                          itemCount: _list.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (context, i) {
                            final c = _list[i] as Map<String, dynamic>;
                            final status = c['status']?.toString() ?? '';
                            final order = c['order'];
                            final ref = order is Map
                                ? (order['marketplaceOrderId'] ?? order['id'])?.toString()
                                : c['orderId']?.toString();
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.border),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.gavel, color: _statusColor(status)),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(ref ?? '—',
                                            style: const TextStyle(
                                                fontWeight: FontWeight.w600, fontSize: 14)),
                                        Text(c['reason']?.toString() ?? '',
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

  Widget _miniKpi(String t, String v, Color c) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Text(v, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: c)),
            const SizedBox(width: 8),
            Text(t, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}