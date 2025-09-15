'use client';

import { ApiErrorDto } from "@/types/api-types";
import { SnackbarProps } from "@mui/material";

export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// Função para tratar as respostas da API
export async function handleApiResponse<T>(response: Response): Promise<T> {
  // Verificar se a resposta foi bem-sucedida (status 2xx)
  if (response.ok) {
    try {
      // Tentar fazer parse do corpo da resposta como JSON
      return await response.json() as T;
    } catch (error) {
      // Se não houver corpo ou não for JSON válido, retornar um objeto vazio
      return {} as T;
    }
  }

  // Se a resposta não for bem-sucedida, tratar o erro
  let errorMessage = 'Erro desconhecido ao comunicar com o servidor';
  let statusCode = response.status;

  try {
    // Tentar extrair a mensagem de erro da resposta
    const errorData = await response.json() as ApiErrorDto;
    if (errorData.error && errorData.error.message) {
      errorMessage = errorData.error.message;
      statusCode = errorData.error.statusCode || response.status;
    }
  } catch (error) {
    // Se não conseguir extrair a mensagem, usar a mensagem padrão do status HTTP
    errorMessage = `Erro: ${response.statusText || response.status}`;
  }

  // Lançar um erro com a mensagem e o código de status
  throw new ApiError(errorMessage, statusCode);
}

// Tipos para o sistema de notificações
export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

// Função para manipular e formatar erros para exibição ao usuário
export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return `${error.message} (${error.statusCode})`;
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return 'Ocorreu um erro desconhecido';
  }
}