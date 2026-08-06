import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class AlertsScreen extends StatelessWidget {
  const AlertsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 700;
    return ListView(
      padding: EdgeInsets.all(isWide ? 24 : 16),
      children: [
        const Text('Alerts', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        const Text('System and operational alerts for your warehouses.',
            style: TextStyle(color: AppColors.textSecondary)),
        const SizedBox(height: 24),
        Card(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
            child: Column(
              children: [
                Icon(Icons.notifications_none, size: 56, color: AppColors.textSecondary.withOpacity(0.4)),
                const SizedBox(height: 16),
                const Text('No alerts', style: TextStyle(fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}