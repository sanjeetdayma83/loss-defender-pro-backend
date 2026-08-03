import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'sidebar.dart';
import 'topbar.dart';

class AppLayout extends StatelessWidget {
  final Widget child;
  final String title;

  const AppLayout({super.key, required this.child, required this.title});

  @override
  Widget build(BuildContext context) {
    final desktop = MediaQuery.of(context).size.width >= 1100;

    final currentRoute = GoRouter.of(
      context,
    ).routerDelegate.currentConfiguration.uri.toString();

    if (!desktop) {
      return Scaffold(
        drawer: Drawer(child: Sidebar(currentRoute: currentRoute)),
        body: Column(
          children: [
            TopBar(title: title, showMenuButton: true),
            Expanded(child: child),
          ],
        ),
      );
    }

    return Scaffold(
      body: Row(
        children: [
          SizedBox(width: 260, child: Sidebar(currentRoute: currentRoute)),
          Expanded(
            child: Column(
              children: [
                TopBar(title: title),
                Expanded(child: child),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
