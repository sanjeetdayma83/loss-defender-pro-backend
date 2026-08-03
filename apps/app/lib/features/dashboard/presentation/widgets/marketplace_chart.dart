import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/dashboard_provider.dart';

class MarketplaceChart extends ConsumerWidget {
  const MarketplaceChart({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final analytics = ref.watch(marketplaceAnalyticsProvider);

    return analytics.when(
      loading: () => const Card(
        child: SizedBox(
          height: 360,
          child: Center(child: CircularProgressIndicator()),
        ),
      ),
      error: (e, _) => Card(
        child: SizedBox(height: 360, child: Center(child: Text(e.toString()))),
      ),
      data: (items) {
        return Card(
          elevation: 2,
          child: SizedBox(
            height: 360,
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    "Marketplace Distribution",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),

                  const SizedBox(height: 20),

                  SizedBox(
                    height: 250,
                    child: items.isEmpty
                        ? const Center(child: Text("No marketplace data"))
                        : PieChart(
                            PieChartData(
                              sections: items
                                  .map(
                                    (e) => PieChartSectionData(
                                      value: e.total.toDouble(),
                                      title: e.marketplace,
                                      radius: 90,
                                    ),
                                  )
                                  .toList(),
                            ),
                          ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
