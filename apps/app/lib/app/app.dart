import 'package:flutter/material.dart';

import '../routes/app_router.dart';
import '../theme/app_theme.dart';

class LossDefenderApp extends StatelessWidget {
  const LossDefenderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Loss Defender Pro',
      debugShowCheckedModeBanner: false,

      theme: AppTheme.lightTheme,

      routerConfig: AppRouter.router,
    );
  }
}
