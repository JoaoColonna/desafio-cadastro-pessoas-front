'use client';

import { AuthResponseDto } from "@/types/api-types";

const TOKEN_KEY = 'auth_token';
const USER_INFO = 'user_info';

export const TokenService = {
  // Salvar token e informações do usuário
  setToken: (authResponse: AuthResponseDto) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, authResponse.token);
      localStorage.setItem(USER_INFO, JSON.stringify({
        username: authResponse.username,
        email: authResponse.email,
        expiresAt: authResponse.expiresAt,
      }));
    }
  },

  // Obter token
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  // Obter informações do usuário
  getUserInfo: () => {
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem(USER_INFO);
      if (userInfo) {
        return JSON.parse(userInfo);
      }
    }
    return null;
  },

  // Verificar se o usuário está autenticado
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return false;

      const userInfo = localStorage.getItem(USER_INFO);
      if (!userInfo) return false;

      // Verificar se o token expirou
      const { expiresAt } = JSON.parse(userInfo);
      const expirationDate = new Date(expiresAt);
      const now = new Date();

      return expirationDate > now;
    }
    return false;
  },

  // Remover token e informações do usuário (logout)
  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_INFO);
    }
  },

  // Obter cabeçalho de autorização
  getAuthHeader: (): Record<string, string> => {
    const token = TokenService.getToken();
    if (token) {
      return { 'Authorization': `Bearer ${token}` };
    }
    return {};
  }
};