import 'package:flutter/material.dart';
import '../../../../shared/layout/app_layout.dart';

class PlansPage extends StatefulWidget {
  const PlansPage({super.key});

  @override
  State<PlansPage> createState() => _PlansPageState();
}

class _PlansPageState extends State<PlansPage> {
  String selectedPlan = "Free"; // Track active plan for demo

  void _showUpgradeDialog(String planName, String price) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(8)),
              child: Icon(Icons.bolt, color: Colors.blue.shade700),
            ),
            const SizedBox(width: 12),
            Expanded(child: Text("Switch to $planName", style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold))),
          ],
        ),
        content: SizedBox(
          width: MediaQuery.of(context).size.width < 600 ? double.infinity : 420,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("You are about to upgrade your warehouse subscription. Here is a summary of your switch:", style: TextStyle(color: Colors.grey, fontSize: 13)),
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade200)),
                child: Column(
                  children: [
                    _dialogRow("Selected Plan", planName, isBold: true),
                    const Divider(height: 20),
                    _dialogRow("Billing Cycle", "Monthly (Billed today)"),
                    const Divider(height: 20),
                    _dialogRow("Amount Payable", price == "Custom" ? "Contact Sales" : "$price / month", valueColor: Colors.blue.shade700),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Row(
                children: [
                  Icon(Icons.lock_outline, size: 16, color: Colors.grey),
                  SizedBox(width: 6),
                  Expanded(child: Text("Secure 256-bit SSL Encrypted Transaction", style: TextStyle(fontSize: 11, color: Colors.grey))),
                ],
              )
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel", style: TextStyle(color: Colors.grey)),
          ),
          FilledButton(
            onPressed: () {
              setState(() {
                selectedPlan = planName;
              });
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text("Successfully switched to $planName Plan!"), backgroundColor: Colors.green),
              );
            },
            style: FilledButton.styleFrom(backgroundColor: Colors.blue.shade700, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: const Text("Confirm & Upgrade"),
          ),
        ],
      ),
    );
  }

  Widget _dialogRow(String label, String value, {bool isBold = false, Color? valueColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13)),
        Text(value, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.w600, fontSize: 14, color: valueColor ?? Colors.black87)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: "Plans & Pricing",
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Banner Card
            _buildTopBanner(),
            const SizedBox(height: 32),

            // Pricing Cards Grid
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth > 1200;
                final isMobile = constraints.maxWidth < 650;
                return Wrap(
                  spacing: 24,
                  runSpacing: 24,
                  alignment: WrapAlignment.center,
                  children: [
                    SizedBox(
                      width: isWide ? 270 : (isMobile ? double.infinity : 340),
                      child: _buildPricingCard(
                        title: "Free",
                        subtitle: "For getting started",
                        price: "₹0",
                        billing: "Always free",
                        buttonText: "Current Plan",
                        planKey: "Free",
                        isPopular: false,
                        features: ["Up to 1 Warehouse", "Up to 1,000 Scans / mo", "1 GB Storage", "Basic Reports", "Email Support"],
                      ),
                    ),
                    SizedBox(
                      width: isWide ? 270 : (isMobile ? double.infinity : 340),
                      child: _buildPricingCard(
                        title: "Basic",
                        subtitle: "For small warehouses",
                        price: "₹999",
                        billing: "Billed monthly",
                        buttonText: "Upgrade Now",
                        planKey: "Basic",
                        isPopular: false,
                        features: ["Up to 3 Warehouses", "Up to 10,000 Scans / mo", "10 GB Storage", "Advanced Reports", "Email & Chat Support", "Data Export (CSV)"],
                      ),
                    ),
                    SizedBox(
                      width: isWide ? 270 : (isMobile ? double.infinity : 340),
                      child: _buildPricingCard(
                        title: "Professional",
                        subtitle: "For growing businesses",
                        price: "₹2,999",
                        billing: "Billed monthly",
                        buttonText: "Upgrade Now",
                        planKey: "Professional",
                        isPopular: true,
                        features: ["Up to 10 Warehouses", "Up to 50,000 Scans / mo", "100 GB Storage", "Advanced Analytics", "Priority Support", "Video Retention (30 Days)", "API Access", "Data Export (Excel, PDF)"],
                      ),
                    ),
                    SizedBox(
                      width: isWide ? 270 : (isMobile ? double.infinity : 340),
                      child: _buildPricingCard(
                        title: "Enterprise",
                        subtitle: "For large operations",
                        price: "Custom",
                        billing: "Tailored for your business",
                        buttonText: "Contact Sales",
                        planKey: "Enterprise",
                        isPopular: false,
                        features: ["Unlimited Warehouses", "Unlimited Scans", "Unlimited Storage", "Custom Analytics", "24/7 Dedicated Support", "Video Retention (90 Days)", "API Access", "SSO & Role Management", "Custom Integrations"],
                      ),
                    ),
                  ],
                );
              },
            ),
            const SizedBox(height: 48),

            // Comparison Table Section
            _buildComparisonTable(),
            const SizedBox(height: 48),

            // Trust Badges Footer
            _buildTrustBadges(),
          ],
        ),
      ),
    );
  }

  Widget _buildTopBanner() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Wrap(
        alignment: WrapAlignment.spaceBetween,
        crossAxisAlignment: WrapCrossAlignment.center,
        runSpacing: 16,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(12)),
                child: Icon(Icons.diamond_outlined, color: Colors.blue.shade700, size: 28),
              ),
              const SizedBox(width: 16),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Choose the perfect plan", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    SizedBox(height: 4),
                    Text("Scale as you grow. Upgrade or downgrade anytime seamlessly.", style: TextStyle(color: Colors.grey, fontSize: 13)),
                  ],
                ),
              ),
            ],
          ),
          Wrap(
            spacing: 24,
            runSpacing: 12,
            children: [
              _traitsBadge(Icons.security, "Secure", "99.9% uptime"),
              _traitsBadge(Icons.support_agent, "24/7 Support", "Dedicated team"),
            ],
          )
        ],
      ),
    );
  }

  Widget _traitsBadge(IconData icon, String title, String subtitle) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, color: Colors.blue.shade700, size: 20),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 11)),
          ],
        ),
      ],
    );
  }

  Widget _buildPricingCard({
    required String title,
    required String subtitle,
    required String price,
    required String billing,
    required String buttonText,
    required String planKey,
    required bool isPopular,
    required List<String> features,
  }) {
    final bool isCurrent = selectedPlan == planKey;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isPopular ? const Color(0xFF6366F1) : Colors.grey.shade200,
          width: isPopular ? 2 : 1,
        ),
        boxShadow: [
          if (isPopular)
            BoxShadow(color: const Color(0xFF6366F1).withValues(alpha: 0.12), blurRadius: 20, offset: const Offset(0, 6))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (isPopular)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 6),
              decoration: const BoxDecoration(
                color: Color(0xFF6366F1),
                borderRadius: BorderRadius.vertical(top: Radius.circular(14)),
              ),
              child: const Text("Most Popular", textAlign: TextAlign.center, style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
            ),
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 13)),
                const SizedBox(height: 20),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(price, style: const TextStyle(fontSize: 30, fontWeight: FontWeight.bold)),
                    if (price != "Custom") ...[
                      const SizedBox(width: 4),
                      const Padding(
                        padding: EdgeInsets.only(bottom: 6.0),
                        child: Text("/month", style: TextStyle(color: Colors.grey, fontSize: 12)),
                      ),
                    ]
                  ],
                ),
                const SizedBox(height: 4),
                Text(billing, style: const TextStyle(color: Colors.grey, fontSize: 12)),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 44,
                  child: isCurrent
                      ? OutlinedButton(
                          onPressed: null,
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: Colors.green.shade600),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.check_circle, size: 16, color: Colors.green.shade600),
                              const SizedBox(width: 6),
                              Text("Current Plan", style: TextStyle(color: Colors.green.shade600, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        )
                      : FilledButton(
                          onPressed: () => _showUpgradeDialog(title, price),
                          style: FilledButton.styleFrom(
                            backgroundColor: isPopular ? const Color(0xFF6366F1) : Colors.blue.shade700,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                          child: Text(buttonText, style: const TextStyle(fontWeight: FontWeight.bold)),
                        ),
                ),
                const SizedBox(height: 24),
                const Divider(),
                const SizedBox(height: 16),
                ...features.map((feature) => Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: Row(
                    children: [
                      const Icon(Icons.check, color: Colors.green, size: 18),
                      const SizedBox(width: 10),
                      Expanded(child: Text(feature, style: const TextStyle(fontSize: 13, color: Colors.black87))),
                    ],
                  ),
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildComparisonTable() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(24.0),
            child: Text("Compare Plans", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              headingRowColor: WidgetStateProperty.all(Colors.grey.shade50),
              columns: const [
                DataColumn(label: Text("Features", style: TextStyle(fontWeight: FontWeight.bold))),
                DataColumn(label: Text("Free", style: TextStyle(fontWeight: FontWeight.bold))),
                DataColumn(label: Text("Basic", style: TextStyle(fontWeight: FontWeight.bold))),
                DataColumn(label: Text("Professional", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF6366F1)))),
                DataColumn(label: Text("Enterprise", style: TextStyle(fontWeight: FontWeight.bold))),
              ],
              rows: [
                _tableRow("Warehouses", "Up to 1", "Up to 3", "Up to 10", "Unlimited"),
                _tableRow("Scans / Month", "1,000", "10,000", "50,000", "Unlimited"),
                _tableRow("Storage", "1 GB", "10 GB", "100 GB", "Unlimited"),
                _tableRow("Video Retention", "7 Days", "15 Days", "30 Days", "90 Days"),
                _tableRow("Support", "Email", "Email & Chat", "Priority", "24/7 Dedicated"),
                _tableRow("API Access", "—", "—", "✓", "✓"),
              ],
            ),
          ),
        ],
      ),
    );
  }

  DataRow _tableRow(String feature, String free, String basic, String pro, String enterprise) {
    return DataRow(
      cells: [
        DataCell(Text(feature, style: const TextStyle(fontWeight: FontWeight.w500))),
        DataCell(Text(free)),
        DataCell(Text(basic)),
        DataCell(Text(pro, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF6366F1)))),
        DataCell(Text(enterprise)),
      ],
    );
  }

  Widget _buildTrustBadges() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Wrap(
        alignment: WrapAlignment.spaceAround,
        runSpacing: 16,
        spacing: 16,
        children: [
          _trustItem(Icons.verified_user, "30-Day Money Back", "Risk-free trial"),
          _trustItem(Icons.lock, "Secure Payments", "SSL encrypted"),
          _trustItem(Icons.autorenew, "No Lock-in", "Cancel anytime"),
          _trustItem(Icons.star, "Trusted by 500+", "Global leaders"),
        ],
      ),
    );
  }

  Widget _trustItem(IconData icon, String title, String subtitle) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(color: Colors.blue.shade50, shape: BoxShape.circle),
          child: Icon(icon, color: Colors.blue.shade700, size: 20),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 11)),
          ],
        ),
      ],
    );
  }
}
