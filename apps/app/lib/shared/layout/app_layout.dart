import 'package:flutter/material.dart';
import 'sidebar.dart';
import 'responsive.dart';

class AppLayout extends StatelessWidget {
  final Widget child;
  final String title;

  const AppLayout({
    super.key,
    required this.child,
    this.title = '',
  });

  @override
  Widget build(BuildContext context) {
    return Responsive(
      // --- MOBILE LAYOUT ---
      // Mobile par Sidebar ek Drawer (Menu) ban jayega aur upar AppBar aayega
      mobile: Scaffold(
        backgroundColor: const Color(0xFFF5F6FA),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 1,
          iconTheme: const IconThemeData(color: Color(0xFF1E2329)),
          title: Text(
            title, 
            style: const TextStyle(color: Color(0xFF1E2329), fontSize: 16, fontWeight: FontWeight.bold)
          ),
        ),
        drawer: const Drawer(
          child: Sidebar(),
        ),
        body: SafeArea(child: child),
      ),
      
      // --- DESKTOP LAYOUT ---
      // Desktop par Sidebar left mein fixed rahega, jaisa pehle tha
      desktop: Scaffold(
        backgroundColor: const Color(0xFFF5F6FA),
        body: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Sidebar(),
            Expanded(
              child: child,
            ),
          ],
        ),
      ),
    );
  }
}
