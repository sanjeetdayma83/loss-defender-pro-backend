import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../providers/evidence_provider.dart';
import '../widgets/evidence_info_card.dart';

class EvidencePage extends ConsumerWidget {
  final String orderId;

  const EvidencePage({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final evidence = ref.watch(evidenceProvider(orderId));

    return Scaffold(
      appBar: AppBar(title: const Text("Evidence")),
      body: evidence.when(
        loading: () => const Center(child: CircularProgressIndicator()),

        error: (e, _) => Center(child: Text(e.toString())),

        data: (item) {
          return Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                EvidenceInfoCard(evidence: item),

                const SizedBox(height: 24),

                FilledButton.icon(
                  onPressed: () {
                    // Download/Open video
                  },
                  icon: const Icon(Icons.play_circle),
                  label: const Text("View Evidence"),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
