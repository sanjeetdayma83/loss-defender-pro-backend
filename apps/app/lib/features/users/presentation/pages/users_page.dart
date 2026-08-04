import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../../shared/layout/app_layout.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_endpoints.dart';

class UsersPage extends StatefulWidget {
  const UsersPage({super.key});

  @override
  State<UsersPage> createState() => _UsersPageState();
}

class _UsersPageState extends State<UsersPage> {
  final Dio _dio = ApiClient.dio;

  List<Map<String, dynamic>> usersList = [];
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    fetchUsers();
  }

  List<dynamic> _extractItems(dynamic body) {
    if (body is List) return body;
    if (body is! Map) return [];
    final map = Map<String, dynamic>.from(body);
    final data = map['data'];
    if (data is List) return data;
    if (data is Map) {
      final inner = Map<String, dynamic>.from(data);
      if (inner['items'] is List) return inner['items'] as List;
      if (inner['data'] is List) return inner['data'] as List;
    }
    if (map['items'] is List) return map['items'] as List;
    return [];
  }

  String _displayName(Map<String, dynamic> e) {
    final first = (e['firstName'] ?? '').toString().trim();
    final last = (e['lastName'] ?? '').toString().trim();
    final combined = '$first $last'.trim();
    if (combined.isNotEmpty) return combined;
    return (e['name'] ?? e['username'] ?? e['email'] ?? 'User').toString();
  }

  Future<void> fetchUsers() async {
    setState(() {
      isLoading = true;
      errorMessage = null;
    });
    try {
      final response = await _dio.get(ApiEndpoints.users);
      final items = _extractItems(response.data);

      setState(() {
        usersList = items.map<Map<String, dynamic>>((raw) {
          final e = Map<String, dynamic>.from(raw as Map);
          final status = (e['status'] ?? e['isActive'] ?? 'ACTIVE').toString();
          final normalized = status.toUpperCase().contains('ACTIVE') &&
                  !status.toUpperCase().contains('INACTIVE')
              ? 'Active'
              : status.toUpperCase().contains('PEND')
                  ? 'Pending'
                  : status.toUpperCase().contains('INACTIVE') ||
                          status.toUpperCase().contains('SUSPEND')
                      ? 'Inactive'
                      : status;
          return {
            'id': (e['id'] ?? e['_id'] ?? '').toString(),
            'name': _displayName(e),
            'email': (e['email'] ?? '—').toString(),
            'role': (e['role'] ?? '—').toString(),
            'warehouse': (e['warehouseName'] ??
                    e['warehouse']?['name'] ??
                    e['warehouseId'] ??
                    '—')
                .toString(),
            'status': normalized,
          };
        }).toList();
        isLoading = false;
      });
    } on DioException catch (e) {
      final msg = e.response?.data is Map
          ? (e.response!.data['message']?.toString() ?? e.message)
          : (e.message ?? 'Failed to load users');
      setState(() {
        isLoading = false;
        errorMessage = msg;
        usersList = [];
      });
    } catch (e) {
      setState(() {
        isLoading = false;
        errorMessage = e.toString();
        usersList = [];
      });
    }
  }

  Future<void> toggleUserStatus(String userId, String currentStatus) async {
    if (userId.isEmpty) {
      _showSnack('Invalid user id', isError: true);
      return;
    }
    final activate = currentStatus != 'Active';
    final path = activate
        ? '${ApiEndpoints.users}/$userId/activate'
        : '${ApiEndpoints.users}/$userId/deactivate';

    try {
      await _dio.patch(path);
      if (!mounted) return;
      _showSnack(
        activate ? 'User activated' : 'User deactivated',
        isError: false,
      );
      await fetchUsers();
    } on DioException catch (e) {
      if (!mounted) return;
      final msg = e.response?.data is Map
          ? (e.response!.data['message']?.toString() ??
              'Update failed (${e.response?.statusCode})')
          : (e.message ?? 'Update failed');
      _showSnack(msg, isError: true);
      // Do NOT update local list or pretend success
    } catch (e) {
      if (!mounted) return;
      _showSnack(e.toString(), isError: true);
    }
  }

  void _showSnack(String message, {required bool isError}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red.shade700 : Colors.green.shade700,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppLayout(
      title: 'Users & Roles',
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isMobile = constraints.maxWidth < 600;
          return SingleChildScrollView(
            padding: EdgeInsets.all(isMobile ? 16.0 : 32.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Wrap(
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  runSpacing: 12,
                  children: [
                    const Text(
                      'System Users & Permissions',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    IconButton(
                      tooltip: 'Refresh',
                      onPressed: isLoading ? null : fetchUsers,
                      icon: const Icon(Icons.refresh),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                if (errorMessage != null) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline, color: Colors.red.shade700),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            errorMessage!,
                            style: TextStyle(color: Colors.red.shade800),
                          ),
                        ),
                        TextButton(
                          onPressed: fetchUsers,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                Card(
                  elevation: 0,
                  color: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.grey.shade200),
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(isMobile ? 12.0 : 20.0),
                    child: isLoading
                        ? const Center(
                            child: Padding(
                              padding: EdgeInsets.all(40.0),
                              child: CircularProgressIndicator(),
                            ),
                          )
                        : usersList.isEmpty && errorMessage == null
                            ? const Padding(
                                padding: EdgeInsets.all(32),
                                child: Center(child: Text('No users found')),
                              )
                            : usersList.isEmpty
                                ? const SizedBox.shrink()
                                : SingleChildScrollView(
                                    scrollDirection: Axis.horizontal,
                                    child: DataTable(
                                      headingRowColor: WidgetStateProperty.all(
                                        Colors.grey.shade50,
                                      ),
                                      columnSpacing: isMobile ? 16 : 24,
                                      columns: const [
                                        DataColumn(
                                          label: Text(
                                            'Name',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        DataColumn(
                                          label: Text(
                                            'Email',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        DataColumn(
                                          label: Text(
                                            'Role',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        DataColumn(
                                          label: Text(
                                            'Warehouse',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        DataColumn(
                                          label: Text(
                                            'Status',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        DataColumn(
                                          label: Text(
                                            'Actions',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                      ],
                                      rows: usersList.map((user) {
                                        final status =
                                            user['status'].toString();
                                        final isActive = status == 'Active';
                                        return DataRow(
                                          cells: [
                                            DataCell(
                                              Text(
                                                user['name'].toString(),
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                            DataCell(
                                              Text(
                                                user['email'].toString(),
                                                style: const TextStyle(
                                                  color: Colors.grey,
                                                ),
                                              ),
                                            ),
                                            DataCell(
                                              Text(user['role'].toString()),
                                            ),
                                            DataCell(
                                              Text(
                                                user['warehouse'].toString(),
                                              ),
                                            ),
                                            DataCell(
                                              Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                  horizontal: 8,
                                                  vertical: 4,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: isActive
                                                      ? Colors.green
                                                          .withValues(alpha: 0.1)
                                                      : Colors.orange
                                                          .withValues(alpha: 0.1),
                                                  borderRadius:
                                                      BorderRadius.circular(4),
                                                ),
                                                child: Text(
                                                  status,
                                                  style: TextStyle(
                                                    color: isActive
                                                        ? Colors.green
                                                        : Colors.orange,
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.bold,
                                                  ),
                                                ),
                                              ),
                                            ),
                                            DataCell(
                                              IconButton(
                                                icon: Icon(
                                                  isActive
                                                      ? Icons.block
                                                      : Icons.check_circle,
                                                  size: 18,
                                                  color: isActive
                                                      ? Colors.red
                                                      : Colors.green,
                                                ),
                                                onPressed: () =>
                                                    toggleUserStatus(
                                                  user['id'].toString(),
                                                  status,
                                                ),
                                                tooltip: isActive
                                                    ? 'Deactivate User'
                                                    : 'Activate User',
                                              ),
                                            ),
                                          ],
                                        );
                                      }).toList(),
                                    ),
                                  ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}



