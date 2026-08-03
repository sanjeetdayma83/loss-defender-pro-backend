import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/app_colors.dart';
import '../widgets/app_logo.dart';

class Sidebar extends StatelessWidget {
  final String currentRoute;

  const Sidebar({super.key, required this.currentRoute});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
      color: Colors.white,
      child: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 20),

            const AppLogo(size: 64),

            const SizedBox(height: 12),

            const Text(
              "Loss Defender Pro",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 35),

            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                children: [
                  _item(
                    context,
                    Icons.dashboard_rounded,
                    "Dashboard",
                    "/dashboard",
                  ),

                  _item(
                    context,
                    Icons.shopping_cart_rounded,
                    "Orders",
                    "/orders",
                  ),

                  _item(
                    context,
                    Icons.qr_code_scanner_rounded,
                    "Scanner",
                    "/scanner",
                  ),

                  _item(
                    context,
                    Icons.videocam_rounded,
                    "Recording",
                    "/recording",
                  ),

                  _item(
                    context,
                    Icons.analytics_rounded,
                    "Analytics",
                    "/analytics",
                  ),

                  _item(
                    context,
                    Icons.warning_amber_rounded,
                    "Alerts",
                    "/alerts",
                  ),

                  _item(
                    context,
                    Icons.keyboard_return_rounded,
                    "Returns",
                    "/returns",
                  ),

                  _item(context, Icons.people_alt_rounded, "Users", "/users"),

                  _item(
                    context,
                    Icons.settings_rounded,
                    "Settings",
                    "/settings",
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Column(
                  children: [
                    Icon(
                      Icons.workspace_premium,
                      color: Colors.white,
                      size: 42,
                    ),

                    SizedBox(height: 10),

                    Text(
                      "Upgrade to Pro",
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),

                    SizedBox(height: 8),

                    Text(
                      "Unlock AI Analytics and Premium Features",
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _item(
    BuildContext context,
    IconData icon,
    String title,
    String route,
  ) {
    final selected = currentRoute == route;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          context.go(route);
        },
        child: Container(
          height: 56,
          decoration: BoxDecoration(
            color: selected
                ? AppColors.primary.withValues(alpha: .08)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              const SizedBox(width: 18),

              Icon(
                icon,
                color: selected ? AppColors.primary : Colors.grey.shade700,
              ),

              const SizedBox(width: 16),

              Text(
                title,
                style: TextStyle(
                  fontWeight: selected ? FontWeight.bold : FontWeight.w500,
                  color: selected ? AppColors.primary : Colors.black87,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
