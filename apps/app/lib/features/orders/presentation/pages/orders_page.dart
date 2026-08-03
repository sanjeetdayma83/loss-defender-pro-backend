import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../shared/layout/app_layout.dart';
import '../providers/orders_provider.dart';
import '../providers/orders_query_provider.dart';
import '../widgets/orders_filters.dart';
import '../widgets/orders_table.dart';
import '../widgets/orders_toolbar.dart';
import '../widgets/pagination_footer.dart';

class OrdersPage extends ConsumerWidget {
  const OrdersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);

    return AppLayout(
      title: "Orders",
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: orders.when(
          loading: () => const Center(child: CircularProgressIndicator()),

          error: (e, _) => Center(child: Text(e.toString())),

          data: (response) {
            return Column(
              children: [
                OrdersToolbar(
                  onSearch: (value) {
                    ref.read(ordersQueryProvider.notifier).search(value);
                  },
                  onRefresh: () {
                    ref.invalidate(ordersProvider);
                  },
                  onNewOrder: () {},
                ),

                const SizedBox(height: 16),

                OrdersFilters(
                  onMarketplace: (value) {
                    ref
                        .read(ordersQueryProvider.notifier)
                        .changeMarketplace(value);
                  },
                  onStatus: (value) {
                    ref.read(ordersQueryProvider.notifier).changeStatus(value);
                  },
                  onPriority: (value) {
                    ref
                        .read(ordersQueryProvider.notifier)
                        .changePriority(value);
                  },
                ),

                const SizedBox(height: 20),

                Expanded(child: OrdersTable(search: "")),

                PaginationFooter(
                  page: response.page,
                  total: response.total,
                  limit: response.limit,
                  hasNext: response.hasNext,
                  hasPrevious: response.hasPrevious,

                  next: response.hasNext
                      ? () {
                          ref
                              .read(ordersQueryProvider.notifier)
                              .changePage(response.page + 1);
                        }
                      : null,

                  previous: response.hasPrevious
                      ? () {
                          ref
                              .read(ordersQueryProvider.notifier)
                              .changePage(response.page - 1);
                        }
                      : null,
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
