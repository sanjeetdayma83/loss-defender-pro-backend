import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../data/models/evidence_model.dart';
import '../../data/repositories/evidence_repository.dart';

final evidenceRepositoryProvider = Provider<EvidenceRepository>(
  (ref) => EvidenceRepository(),
);

final evidenceProvider = FutureProvider.family<EvidenceModel, String>((
  ref,
  orderId,
) async {
  return ref.read(evidenceRepositoryProvider).getEvidence(orderId);
});
