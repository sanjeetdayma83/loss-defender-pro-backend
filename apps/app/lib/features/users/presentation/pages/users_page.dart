import 'package:flutter/material.dart';
import '../../../../shared/layout/app_layout.dart';

class UsersPage extends StatefulWidget {
  const UsersPage({super.key});

  @override
  State<UsersPage> createState() => _UsersPageState();
}

class _UsersPageState extends State<UsersPage> {
  int selectedUserIndex = 0;

  final List<Map<String, dynamic>> usersList = [
    {"name": "Rahul Sharma", "email": "rahul.sharma@enterprises.com", "role": "Admin", "warehouse": "Main Warehouse", "status": "Active", "lastActive": "16 May 2026, 10:32 AM", "phone": "+91 98765 43210", "joined": "01 Apr 2026, 09:15 AM"},
    {"name": "Priya Verma", "email": "priya.verma@enterprises.com", "role": "Manager", "warehouse": "North Zone WH", "status": "Active", "lastActive": "16 May 2026, 09:45 AM", "phone": "+91 98765 43211", "joined": "05 Apr 2026, 10:00 AM"},
    {"name": "Amit Singh", "email": "amit.singh@enterprises.com", "role": "Operator", "warehouse": "South Zone WH", "status": "Active", "lastActive": "16 May 2026, 09:12 AM", "phone": "+91 98765 43212", "joined": "10 Apr 2026, 11:30 AM"},
    {"name": "Vikram Patel", "email": "vikram.patel@enterprises.com", "role": "Verifier", "warehouse": "East Zone WH", "status": "Active", "lastActive": "16 May 2026, 08:50 AM", "phone": "+91 98765 43213", "joined": "12 Apr 2026, 01:15 PM"},
    {"name": "Neha Gupta", "email": "neha.gupta@enterprises.com", "role": "Operator", "warehouse": "Main Warehouse", "status": "Inactive", "lastActive": "15 May 2026, 04:20 PM", "phone": "+91 98765 43214", "joined": "15 Apr 2026, 02:45 PM"},
  ];

  @override
  Widget build(BuildContext context) {
    final currentUser = usersList[selectedUserIndex];

    return AppLayout(
      title: "Users",
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top 5 Metric Cards
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth > 1200;
                return Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  children: [
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Total Users", "256", "+12.5% vs last week", Icons.people_outline, Colors.blue)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Active Users", "198", "+16.3% vs last week", Icons.verified_user_outlined, Colors.green)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Inactive Users", "32", "-8.7% vs last week", Icons.person_off_outlined, Colors.orange)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Admins", "24", "+4.2% vs last week", Icons.admin_panel_settings_outlined, Colors.purple)),
                    SizedBox(width: isWide ? (constraints.maxWidth - 64) / 5 : (constraints.maxWidth > 700 ? (constraints.maxWidth - 16) / 2 : double.infinity), child: _buildStatCard("Blocked Users", "2", "-33.3% vs last week", Icons.block_outlined, Colors.red)),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),

            // Middle Layout (Users List + Right Details Panel)
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth > 1100;
                return Flex(
                  direction: isWide ? Axis.horizontal : Axis.vertical,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Users Table Section
                    Expanded(
                      flex: 7,
                      child: Card(
                        elevation: 0,
                        color: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text("Users List", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                  Row(
                                    children: [
                                      SizedBox(
                                        width: 250,
                                        height: 38,
                                        child: TextField(
                                          decoration: InputDecoration(
                                            hintText: "Search by name, email...",
                                            prefixIcon: const Icon(Icons.search, size: 18),
                                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                                            contentPadding: EdgeInsets.zero,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      FilledButton.icon(
                                        onPressed: () {},
                                        icon: const Icon(Icons.add, size: 16),
                                        label: const Text("Add User"),
                                        style: FilledButton.styleFrom(backgroundColor: Colors.blue.shade700),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: DataTable(
                                  headingRowColor: WidgetStateProperty.all(Colors.grey.shade50),
                                  columns: const [
                                    DataColumn(label: Text("User", style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text("Email", style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text("Role", style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text("Warehouse", style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text("Status", style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text("Last Active", style: TextStyle(fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text("Actions", style: TextStyle(fontWeight: FontWeight.bold))),
                                  ],
                                  rows: List.generate(usersList.length, (index) {
                                    final u = usersList[index];
                                    final isSelected = selectedUserIndex == index;
                                    final status = u["status"].toString();

                                    return DataRow(
                                      selected: isSelected,
                                      onSelectChanged: (val) => setState(() => selectedUserIndex = index),
                                      cells: [
                                        DataCell(Row(
                                          children: [
                                            CircleAvatar(backgroundColor: Colors.blue.shade100, radius: 14, child: Text(u["name"].toString()[0], style: TextStyle(color: Colors.blue.shade800, fontSize: 12, fontWeight: FontWeight.bold))),
                                            const SizedBox(width: 10),
                                            Text(u["name"].toString(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                          ],
                                        )),
                                        DataCell(Text(u["email"].toString())),
                                        DataCell(_badge(u["role"].toString(), Colors.blue)),
                                        DataCell(Text(u["warehouse"].toString())),
                                        DataCell(_badge(status, status == "Active" ? Colors.green : Colors.orange)),
                                        DataCell(Text(u["lastActive"].toString(), style: const TextStyle(color: Colors.grey, fontSize: 12))),
                                        DataCell(Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            IconButton(icon: const Icon(Icons.visibility, size: 16, color: Colors.blue), onPressed: () => setState(() => selectedUserIndex = index)),
                                            IconButton(icon: const Icon(Icons.edit, size: 16, color: Colors.grey), onPressed: () {}),
                                          ],
                                        )),
                                      ],
                                    );
                                  }),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    if (isWide) const SizedBox(width: 24) else const SizedBox(height: 24),

                    // Right User Details Panel
                    Expanded(
                      flex: 5,
                      child: Card(
                        elevation: 0,
                        color: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(backgroundColor: Colors.blue.shade100, radius: 24, child: Text(currentUser["name"].toString()[0], style: TextStyle(color: Colors.blue.shade800, fontSize: 18, fontWeight: FontWeight.bold))),
                                  const SizedBox(width: 16),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(currentUser["name"].toString(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                      const SizedBox(height: 2),
                                      Row(
                                        children: [
                                          Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
                                          const SizedBox(width: 6),
                                          const Text("Online", style: TextStyle(color: Colors.green, fontSize: 12, fontWeight: FontWeight.bold)),
                                        ],
                                      )
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 20),
                              _detailRow("User ID", "USR-20260516-001"),
                              const Divider(height: 16),
                              _detailRow("Email", currentUser["email"].toString()),
                              const Divider(height: 16),
                              _detailRow("Phone", currentUser["phone"].toString()),
                              const Divider(height: 16),
                              _detailRow("Role", currentUser["role"].toString()),
                              const Divider(height: 16),
                              _detailRow("Warehouse", currentUser["warehouse"].toString()),
                              const Divider(height: 16),
                              _detailRow("Joined On", currentUser["joined"].toString()),
                              const Divider(height: 16),
                              _detailRow("Last Active", currentUser["lastActive"].toString()),
                              const SizedBox(height: 20),
                              const Text("Permissions", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              const SizedBox(height: 8),
                              _permissionCheck("Dashboard Access"),
                              _permissionCheck("Order Management"),
                              _permissionCheck("Scanning & Video Monitoring"),
                              _permissionCheck("User Management"),
                              const SizedBox(height: 24),
                              Row(
                                children: [
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: () {},
                                      icon: const Icon(Icons.edit, size: 16),
                                      label: const Text("Edit User"),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: () {},
                                      icon: const Icon(Icons.block, size: 16, color: Colors.red),
                                      label: const Text("Deactivate", style: TextStyle(color: Colors.red)),
                                      style: OutlinedButton.styleFrom(side: const BorderSide(color: Colors.red)),
                                    ),
                                  ),
                                ],
                              ),
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

  Widget _buildStatCard(String title, String value, String sub, IconData icon, Color color) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.w500)),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                  child: Icon(icon, color: color, size: 20),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(sub, style: TextStyle(color: sub.contains("+") ? Colors.green : Colors.grey, fontSize: 11, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _badge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
      child: Text(text, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }

  Widget _detailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: Colors.black87)),
      ],
    );
  }

  Widget _permissionCheck(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        children: [
          const Icon(Icons.check, color: Colors.green, size: 16),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.black87)),
        ],
      ),
    );
  }
}
