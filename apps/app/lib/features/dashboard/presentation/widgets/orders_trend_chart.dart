import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/dashboard_analytics.dart';
import '../providers/dashboard_provider.dart';

final dailyTrendProvider = FutureProvider<List<DailyTrend>>((ref) async {
  return ref.read(dashboardRepositoryProvider).getDailyTrend();
});

class OrdersTrendChart extends ConsumerWidget {
  const OrdersTrendChart({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final trend = ref.watch(dailyTrendProvider);

    return trend.when(
      loading: () => const Card(
        child: SizedBox(
          height: 320,
          child: Center(child: CircularProgressIndicator()),
        ),
      ),

      error: (e, _) => Card(
        child: SizedBox(height: 320, child: Center(child: Text(e.toString()))),
      ),

      data: (data) {
        if (data.isEmpty) {
          return const Card(
            child: SizedBox(
              height: 320,
              child: Center(child: Text("No trend data available")),
            ),
          );
        }
        return Card(
          elevation: 2,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Orders Trend",
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),

                const SizedBox(height: 20),

                SizedBox(
                  height: 240,
                  child: LineChart(
                    LineChartData(
                      borderData: FlBorderData(show: false),

                      gridData: FlGridData(show: true),

                      titlesData: FlTitlesData(
                        leftTitles: const AxisTitles(),
                        rightTitles: const AxisTitles(),
                        topTitles: const AxisTitles(),

                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (value, meta) {
                              final index = value.toInt();

                              if (index >= data.length) {
                                return const SizedBox();
                              }

                              final date = data[index].date;

                              return Text(
                                date.length >= 5 ? date.substring(5) : date,
                                style: const TextStyle(fontSize: 10),
                              );
                            },
                          ),
                        ),
                      ),

                      lineBarsData: [
                        LineChartBarData(
                          isCurved: true,

                          barWidth: 4,

                          dotData: const FlDotData(show: true),

                          spots: List.generate(
                            data.length,
                            (i) =>
                                FlSpot(i.toDouble(), data[i].total.toDouble()),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
