import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class TopBar extends StatelessWidget {
  final String title;
  final bool showMenuButton;

  const TopBar({super.key, required this.title, this.showMenuButton = false});

  @override
  Widget build(BuildContext context) {
    final isMobile = MediaQuery.of(context).size.width < 650;

    return Container(
      height: 72,
      padding: EdgeInsets.symmetric(horizontal: isMobile ? 12 : 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xffE5E7EB))),
      ),
      child: Row(
        children: [
          if (showMenuButton) ...[
            IconButton(
              onPressed: () => Scaffold.of(context).openDrawer(),
              icon: const Icon(Icons.menu),
            ),
            const SizedBox(width: 4),
          ],

          Expanded(
            child: Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: isMobile ? 20 : 26,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF1E2329),
              ),
            ),
          ),

          const SizedBox(width: 8),

          IconButton(
            onPressed: () {
              // Notification action or route
            },
            icon: const Icon(Icons.notifications_none, color: Colors.grey),
          ),

          const SizedBox(width: 4),

          // Clickable Profile Avatar that navigates to /profile
          InkWell(
            onPressed: () => context.go('/profile'),
            borderRadius: BorderRadius.circular(20),
            child: const Padding(
              padding: EdgeInsets.all(4.0),
              child: CircleAvatar(
                radius: 16,
                backgroundColor: Color(0xFFE0E7FF),
                child: Icon(Icons.person, size: 20, color: Color(0xFF1E40AF)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
