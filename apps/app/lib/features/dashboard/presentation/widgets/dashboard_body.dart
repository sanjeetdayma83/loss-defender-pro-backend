import 'package:flutter/material.dart';

import '../../data/models/dashboard_summary.dart';
import 'dashboard_grid.dart';
import 'dashboard_header.dart';
import 'dashboard_recent_orders_table.dart';
import 'marketplace_chart.dart';
import 'orders_trend_chart.dart';
import 'quick_action_card.dart';
import 'status_chart.dart';

class DashboardBody extends StatelessWidget {
  final DashboardSummary summary;

  const DashboardBody({super.key, required this.summary});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const DashboardHeader(),

          const SizedBox(height: 30),

          DashboardGrid(summary: summary),

          const SizedBox(height: 40),

          const Text(
            "Quick Actions",
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),

          const SizedBox(height: 20),

          LayoutBuilder(
            builder: (context, constraints) {
              if (constraints.maxWidth < 900) {
                return Column(
                  children: [
                    QuickActionCard(
                      title: "New Order",
                      icon: Icons.add_box_outlined,
                      color: Colors.blue,
                      onTap: () {},
                    ),
                    const SizedBox(height: 16),
                    QuickActionCard(
                      title: "Start Recording",
                      icon: Icons.videocam_outlined,
                      color: Colors.red,
                      onTap: () {},
                    ),
                    const SizedBox(height: 16),
                    QuickActionCard(
                      title: "Open Scanner",
                      icon: Icons.qr_code_scanner,
                      color: Colors.green,
                      onTap: () {},
                    ),
                    const SizedBox(height: 16),
                    QuickActionCard(
                      title: "Reports",
                      icon: Icons.bar_chart_outlined,
                      color: Colors.deepPurple,
                      onTap: () {},
                    ),
                  ],
                );
              }

              return SizedBox(
                height: 140,
                child: Row(
                  children: [
                    Expanded(
                      child: QuickActionCard(
                        title: "New Order",
                        icon: Icons.add_box_outlined,
                        color: Colors.blue,
                        onTap: () {},
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: QuickActionCard(
                        title: "Start Recording",
                        icon: Icons.videocam_outlined,
                        color: Colors.red,
                        onTap: () {},
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: QuickActionCard(
                        title: "Open Scanner",
                        icon: Icons.qr_code_scanner,
                        color: Colors.green,
                        onTap: () {},
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: QuickActionCard(
                        title: "Reports",
                        icon: Icons.bar_chart_outlined,
                        color: Colors.deepPurple,
                        onTap: () {},
                      ),
                    ),
                  ],
                ),
              );
            },
          ),

          const SizedBox(height: 40),

          const Text(
            "Analytics",
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),

          const SizedBox(height: 20),

          const OrdersTrendChart(),

          const SizedBox(height: 24),

          LayoutBuilder(
            builder: (context, constraints) {
              if (constraints.maxWidth < 1100) {
                return const Column(
                  children: [
                    MarketplaceChart(),
                    SizedBox(height: 20),
                    StatusChart(),
                  ],
                );
              }

              return const Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: MarketplaceChart()),
                  SizedBox(width: 20),
                  Expanded(child: StatusChart()),
                ],
              );
            },
          ),

          const SizedBox(height: 40),

          const Text(
            "Recent Orders",
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),

          const SizedBox(height: 20),

          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: .05),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: const DashboardRecentOrdersTable(),
          ),

          const SizedBox(height: 40),
        ],
      ),
    );
  }
}
