import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'sidebar.dart';

class AppLayout extends StatelessWidget {
  final String title;
  final Widget child;
  final bool showBackButton;

  const AppLayout({
    super.key,
    required this.title,
    required this.child,
    this.showBackButton = false,
  });

  @override
  Widget build(BuildContext context) {
    // Current page ka path check karein
    final currentPath = GoRouterState.of(context).uri.path;
    
    // System back tabhi allow hoga jab hum Dashboard pe honge, ya Navigation Stack mein history hogi
    final allowSystemBack = context.canPop() || currentPath == '/dashboard' || currentPath == '/login';

    return PopScope(
      canPop: allowSystemBack,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return; // Agar system ne back handle kar liya toh yahan se return
        
        // Agar app close hone wali thi aur humne rok liya, toh user ko wapas Dashboard pe bhej do
        context.go('/dashboard');
      },
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isMobile = constraints.maxWidth < 960;
          
          return Scaffold(
            backgroundColor: const Color(0xFFF8FAFC),
            drawer: isMobile ? const Drawer(child: Sidebar(isDrawer: true)) : null,
            body: SafeArea(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (!isMobile) const Sidebar(),
                  Expanded(
                    child: Column(
                      children: [
                        Builder(
                          builder: (BuildContext innerContext) {
                            return _buildTopBar(innerContext, isMobile);
                          }
                        ),
                        Expanded(child: child),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTopBar(BuildContext context, bool isMobile) {
    return Container(
      height: 60,
      padding: EdgeInsets.symmetric(horizontal: isMobile ? 12 : 24),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Row(
        children: [
          if (isMobile) ...[
            if (showBackButton)
              IconButton(
                icon: const Icon(Icons.arrow_back, color: Color(0xFF1E2329)),
                onPressed: () {
                  if (context.canPop()) {
                    context.pop();
                  } else {
                    context.go('/dashboard');
                  }
                },
              )
            else
              IconButton(
                icon: const Icon(Icons.menu, color: Color(0xFF1E2329)),
                onPressed: () => Scaffold.of(context).openDrawer(),
              ),
            const SizedBox(width: 8),
          ],
          
          if (!isMobile && showBackButton) ...[
            IconButton(
              icon: const Icon(Icons.arrow_back, color: Color(0xFF1E2329)),
              onPressed: () {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go('/dashboard');
                }
              },
            ),
            const SizedBox(width: 8),
          ],
          
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontSize: isMobile ? 16 : 18,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF1E2329),
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          
          if (!isMobile) ...[
            SizedBox(
              width: 220,
              height: 38,
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search orders...',
                  hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 13),
                  prefixIcon: Icon(Icons.search, size: 18, color: Colors.grey.shade400),
                  filled: true,
                  fillColor: Colors.grey.shade50,
                  contentPadding: EdgeInsets.zero,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                ),
                style: const TextStyle(fontSize: 13),
              ),
            ),
            const SizedBox(width: 12),
          ],

          Stack(
            clipBehavior: Clip.none,
            children: [
              IconButton(
                icon: Icon(Icons.notifications_outlined, color: Colors.grey.shade600, size: 22),
                onPressed: () => context.go('/alerts'),
              ),
              Positioned(
                right: 8,
                top: 8,
                child: Container(
                  width: 8, height: 8,
                  decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                ),
              ),
            ],
          ),
          SizedBox(width: isMobile ? 4 : 8),

          InkWell(
            onTap: () => context.go('/profile'),
            borderRadius: BorderRadius.circular(24),
            child: Padding(
              padding: const EdgeInsets.all(4.0),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 15,
                    backgroundColor: Colors.blue.shade100,
                    child: Text('A', style: TextStyle(color: Colors.blue.shade800, fontWeight: FontWeight.bold, fontSize: 12)),
                  ),
                  if (!isMobile) ...[
                    const SizedBox(width: 8),
                    const Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Admin', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: Color(0xFF1E2329))),
                        Text('Super Admin', style: TextStyle(fontSize: 11, color: Colors.grey)),
                      ],
                    ),
                    const SizedBox(width: 4),
                    Icon(Icons.keyboard_arrow_down, size: 16, color: Colors.grey.shade500),
                  ]
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
