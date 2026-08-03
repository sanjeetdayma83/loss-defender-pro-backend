import 'package:flutter/material.dart';

import '../../data/models/dashboard_summary.dart';
import 'dashboard_card.dart';

class DashboardGrid extends StatelessWidget {
  final DashboardSummary summary;

  const DashboardGrid({super.key, required this.summary});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        int columns = 5;

        if (constraints.maxWidth < 1400) {
          columns = 4;
        }

        if (constraints.maxWidth < 1100) {
          columns = 3;
        }

        if (constraints.maxWidth < 700) {
          columns = 2;
        }

        return GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: columns,
          crossAxisSpacing: 20,
          mainAxisSpacing: 20,
          childAspectRatio: 1.45,
          children: [
            DashboardCard(
              title: "Total Orders",
              value: summary.totalOrders.toString(),
              icon: Icons.shopping_bag,
              color: Colors.blue,
            ),
            DashboardCard(
              title: "Today's Orders",
              value: summary.todayOrders.toString(),
              icon: Icons.today,
              color: Colors.green,
            ),
            DashboardCard(
              title: "Packing",
              value: summary.packing.toString(),
              icon: Icons.inventory_2_outlined,
              color: Colors.orange,
            ),
            DashboardCard(
              title: "Verification",
              value: summary.verification.toString(),
              icon: Icons.fact_check_outlined,
              color: Colors.deepPurple,
            ),
            DashboardCard(
              title: "Ready To Ship",
              value: summary.readyToShip.toString(),
              icon: Icons.local_shipping_outlined,
              color: Colors.red,
            ),
          ],
        );
      },
    );
  }
}
