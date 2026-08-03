import 'package:flutter/material.dart';
import '../../../../shared/layout/app_layout.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: "User Profile",
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              elevation: 0,
              color: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: Colors.blue.shade100,
                      child: Text("A", style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.blue.shade800)),
                    ),
                    const SizedBox(width: 24),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Text("Admin", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                              const SizedBox(width: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(color: Colors.blue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                                child: const Text("Super Admin", style: TextStyle(color: Colors.blue, fontSize: 12, fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          const Text("admin@enterprises.com • +91 98765 43210", style: TextStyle(color: Colors.grey, fontSize: 13)),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
                              const SizedBox(width: 6),
                              const Text("Active Status • Main Warehouse", style: TextStyle(color: Colors.grey, fontSize: 12)),
                            ],
                          )
                        ],
                      ),
                    ),
                    FilledButton.icon(
                      onPressed: () {},
                      icon: const Icon(Icons.edit, size: 16),
                      label: const Text("Edit Profile"),
                      style: FilledButton.styleFrom(backgroundColor: Colors.blue.shade700),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth > 1000;
                return Flex(
                  direction: isWide ? Axis.horizontal : Axis.vertical,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 6,
                      child: Card(
                        elevation: 0,
                        color: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text("Personal Information", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 20),
                              _infoRow("Full Name", "Admin User"),
                              const Divider(height: 20),
                              _infoRow("Email Address", "admin@enterprises.com"),
                              const Divider(height: 20),
                              _infoRow("Phone Number", "+91 98765 43210"),
                              const Divider(height: 20),
                              _infoRow("Assigned Role", "Super Admin"),
                              const Divider(height: 20),
                              _infoRow("Warehouse Location", "Main Warehouse (HQ)"),
                              const Divider(height: 20),
                              _infoRow("Account Created", "01 Jan 2026"),
                            ],
                          ),
                        ),
                      ),
                    ),
                    if (isWide) const SizedBox(width: 24) else const SizedBox(height: 24),
                    Expanded(
                      flex: 6,
                      child: Card(
                        elevation: 0,
                        color: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text("Role & Access Permissions", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              const Text("As a Super Admin, you have unrestricted access to all system modules.", style: TextStyle(color: Colors.grey, fontSize: 12)),
                              const SizedBox(height: 20),
                              _permissionItem("Dashboard & Analytics Overview", true),
                              _permissionItem("Order Management & Processing", true),
                              _permissionItem("Hardware Scanning & Live Camera Feeds", true),
                              _permissionItem("Video Recording & Evidence Audit", true),
                              _permissionItem("User Roles & Permissions Control", true),
                              _permissionItem("System Settings & Configuration", true),
                              _permissionItem("Billing & Subscription Management", true),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: Colors.black87)),
      ],
    );
  }

  Widget _permissionItem(String title, bool isAllowed) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Row(
        children: [
          Icon(isAllowed ? Icons.check_circle : Icons.cancel, color: isAllowed ? Colors.green : Colors.red, size: 18),
          const SizedBox(width: 12),
          Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: Colors.black87)),
        ],
      ),
    );
  }
}
