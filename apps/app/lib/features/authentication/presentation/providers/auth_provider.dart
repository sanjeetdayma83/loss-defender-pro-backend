import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/storage/token_storage.dart';
import '../../data/datasources/auth_remote_datasource.dart';
import '../../data/models/login_request.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/usecases/login_usecase.dart';

enum AuthState { initial, loading, authenticated, unauthenticated, error }

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState.initial);

  final LoginUseCase _loginUseCase = LoginUseCase(
    AuthRepositoryImpl(AuthRemoteDatasource()),
  );

  String? errorMessage;

  Future<bool> login({required String email, required String password}) async {
    try {
      state = AuthState.loading;
      errorMessage = null;

      final response = await _loginUseCase(
        LoginRequest(email: email, password: password),
      );

      await TokenStorage.save(
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      );

      state = AuthState.authenticated;

      return true;
    } catch (e) {
      errorMessage = e.toString();
      state = AuthState.error;
      return false;
    }
  }

  Future<void> logout() async {
    await TokenStorage.clear();
    state = AuthState.unauthenticated;
  }

  Future<bool> checkLogin() async {
    final loggedIn = await TokenStorage.isLoggedIn();

    if (loggedIn) {
      state = AuthState.authenticated;
      return true;
    }

    state = AuthState.unauthenticated;
    return false;
  }
}
