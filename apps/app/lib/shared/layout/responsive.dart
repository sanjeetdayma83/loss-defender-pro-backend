import 'package:flutter/material.dart';

class Responsive extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget desktop;

  const Responsive({
    super.key,
    required this.mobile,
    this.tablet,
    required this.desktop,
  });

  // Mobile ka breakpoint < 850
  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < 850;

  // Tablet ka breakpoint >= 850 and < 1100
  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.width >= 850 &&
      MediaQuery.of(context).size.width < 1100;

  // Desktop ka breakpoint >= 1100
  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= 1100;

  @override
  Widget build(BuildContext context) {
    final Size size = MediaQuery.of(context).size;
    
    // Agar width 1100 ya usse zyada hai toh desktop layout dikhaye
    if (size.width >= 1100) {
      return desktop;
    }
    // Agar width 850 aur 1100 ke beech hai toh tablet layout dikhaye
    else if (size.width >= 850 && tablet != null) {
      return tablet!;
    }
    // Warna (850 se kam hone par) mobile layout dikhaye
    else {
      return mobile;
    }
  }
}
