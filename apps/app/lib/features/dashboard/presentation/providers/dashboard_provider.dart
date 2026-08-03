import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/dashboard_summary.dart';
import '../../data/models/recent_order_model.dart';
import '../../data/repositories/dashboard_repository.dart';
import '../../data/models/dashboard_analytics.dart';

final dashboardRepositoryProvider = Provider((ref) => DashboardRepository());

final dashboardProvider = FutureProvider<DashboardSummary>((ref) {
  return ref.read(dashboardRepositoryProvider).getDashboard();
});

final recentOrdersProvider = FutureProvider<List<RecentOrderModel>>((ref) {
  return ref.read(dashboardRepositoryProvider).getRecentOrders();
});
final marketplaceAnalyticsProvider = FutureProvider<List<MarketplaceAnalytics>>(
  (ref) {
    return ref.read(dashboardRepositoryProvider).getMarketplaceAnalytics();
  },
);
final statusAnalyticsProvider = FutureProvider<List<StatusAnalytics>>((
  ref,
) async {
  return ref.read(dashboardRepositoryProvider).getStatusAnalytics();
});
