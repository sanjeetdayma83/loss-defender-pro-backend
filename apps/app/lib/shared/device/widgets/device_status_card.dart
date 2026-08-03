import 'package:flutter/material.dart';

class DeviceStatusCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool connected;
  final VoidCallback? onTap;

  const DeviceStatusCard({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.connected,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final statusColor = connected ? Colors.green : Colors.red;

    return Card(
      elevation: 2,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: statusColor.withValues(alpha: .15),
                child: Icon(icon, color: statusColor, size: 28),
              ),

              const SizedBox(width: 16),

              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),

                    const SizedBox(height: 4),

                    Text(
                      subtitle,
                      style: TextStyle(color: Colors.grey.shade600),
                    ),

                    const SizedBox(height: 8),

                    Row(
                      children: [
                        Icon(Icons.circle, size: 10, color: statusColor),

                        const SizedBox(width: 6),

                        Text(
                          connected ? 'Connected' : 'Disconnected',
                          style: TextStyle(
                            color: statusColor,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }
}
