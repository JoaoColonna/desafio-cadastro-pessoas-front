'use client';

import { AuthResponseDto, LoginDto, RegisterDto } from "@/types/api-types";
import { handleApiResponse } from "@/utils/api-error-handler";
import { TokenService } from "@/utils/token-service";

// URL base da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const AuthService = {
  // Login
  login: async (credentials: LoginDto): Promise<AuthResponseDto> => {
    const response = await fetch(`${API_URL}/api/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await handleApiResponse<AuthResponseDto>(response);
    
    // Armazenar o token e informações do usuário
    if (data && data.token) {
      TokenService.setToken(data);
    }
    
    return data;
  },

  // Registro
  register: async (userData: RegisterDto): Promise<AuthResponseDto> => {
    const response = await fetch(`${API_URL}/api/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await handleApiResponse<AuthResponseDto>(response);
    
    // Opcionalmente, podemos fazer login automaticamente após o registro bem-sucedido
    // TokenService.setToken(data);
    
    return data;
  },

  // Logout
  logout: (): void => {
    TokenService.removeToken();
    // Redirecionar para a página de login pode ser feito no componente
  },

  // Verificar autenticação
  isAuthenticated: (): boolean => {
    return TokenService.isAuthenticated();
  }
};