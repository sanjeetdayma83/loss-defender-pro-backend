import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../recording/presentation/pages/recording_page.dart';
import '../../../scanner/presentation/pages/scanner_page.dart';
import '../providers/orders_provider.dart';

class OrderActions extends ConsumerWidget {
  final String orderId;

  const OrderActions({super.key, required this.orderId});

  Future<void> _refresh(WidgetRef ref) async {
    ref.invalidate(ordersProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return PopupMenuButton<String>(
      tooltip: "Order Actions",
      onSelected: (value) async {
        switch (value) {
          case "record":
            await Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => RecordingPage(orderId: orderId),
              ),
            );

            await _refresh(ref);
            break;

          case "scanner":
            await Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => ScannerPage(orderId: orderId)),
            );
            await _refresh(ref);
            break;

          case "refresh":
            await _refresh(ref);
            break;
        }
      },
      itemBuilder: (_) => const [
        PopupMenuItem(
          value: "record",
          child: ListTile(
            leading: Icon(Icons.videocam),
            title: Text("Start Recording"),
            contentPadding: EdgeInsets.zero,
          ),
        ),
        PopupMenuItem(
          value: "scanner",
          child: ListTile(
            leading: Icon(Icons.qr_code_scanner),
            title: Text("Open Scanner"),
            contentPadding: EdgeInsets.zero,
          ),
        ),
        PopupMenuItem(
          value: "refresh",
          child: ListTile(
            leading: Icon(Icons.refresh),
            title: Text("Refresh Order"),
            contentPadding: EdgeInsets.zero,
          ),
        ),
      ],
    );
  }
}
