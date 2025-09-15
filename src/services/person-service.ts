'use client';

import {
  PersonDto,
  PersonResponseDto,
  PersonV2Dto,
  PersonV2ResponseDto
} from "@/types/api-types";
import { handleApiResponse } from "@/utils/api-error-handler";
import { TokenService } from "@/utils/token-service";

// URL base da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Versão da API a ser utilizada (v1 ou v2)
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

// Service para Person V1
const PersonServiceV1 = {
  // Listar todas as pessoas
  getAllPersons: async (): Promise<PersonResponseDto[]> => {
    const headers = {
      'Content-Type': 'application/json',
      ...TokenService.getAuthHeader()
    };
    
    const response = await fetch(`${API_URL}/api/v1/Person`, {
      method: 'GET',
      headers
    });

    return handleApiResponse<PersonResponseDto[]>(response);
  },

  // Obter uma pessoa por ID
  getPersonById: async (id: number): Promise<PersonResponseDto> => {
    const headers = {
      'Content-Type': 'application/json',
      ...TokenService.getAuthHeader()
    };
    
    const response = await fetch(`${API_URL}/api/v1/Person/${id}`, {
      method: 'GET',
      headers
    });

    return handleApiResponse<PersonResponseDto>(response);
  },

  // Criar uma nova pessoa
  createPerson: async (personData: PersonDto): Promise<PersonResponseDto> => {
    const headers = {
      'Content-Type': 'application/json',
      ...TokenService.getAuthHeader()
    };
    
    const response = await fetch(`${API_URL}/api/v1/Person`, {
      method: 'POST',
      headers,
      body: JSON.stringify(personData)
    });

    return handleApiResponse<PersonResponseDto>(response);
  },

  // Atualizar uma pessoa
  updatePerson: async (id: number, personData: PersonDto): Promise<PersonResponseDto> => {
    const headers = {
      'Content-Type': 'application/json',
      ...TokenService.getAuthHeader()
    };
    
    const response = await fetch(`${API_URL}/api/v1/Person/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(personData)
    });

    return handleApiResponse<PersonResponseDto>(response);
  },

  // Excluir uma pessoa
  deletePerson: async (id: number): Promise<void> => {
    const headers = {
      'Content-Type': 'application/json',
      ...TokenService.getAuthHeader()
    };
    
    const response = await fetch(`${API_URL}/api/v1/Person/${id}`, {
      method: 'DELETE',
      headers
    });

    return handleApiResponse<void>(response);
  }
};

// Service para Person V2
const PersonServiceV2 = {
  // Listar todas as pessoas
  getAllPersons: async (): Promise<PersonV2ResponseDto[]> => {
    const headers = {
      'Content-Type': 'application/json',
      ...TokenService.getAuthHeader()
    };
    
    const response = await fetch(`${API_URL}/api/v2/PersonV2`, {
      method: 'GET',
      headers
    });

    return handleApiResponse<PersonV2ResponseDto[]>(response);
  },

  // Obter uma pessoa por ID
  getPersonById: async (id: number): Promise<PersonV2ResponseDto> => {
    const headers = {
      'Content-Type': 'application/json',
      ...TokenService.getAuthHeader()
    };
    
    const response = await fetch(`${API_URL}/api/v2/PersonV2/${id}`, {
      method: 'GET',
      headers
    });

    return handleApiResponse<PersonV2ResponseDto>(response);
  },

  // Criar uma nova pessoa
  createPerson: async (personData: PersonV2Dto): Promise<PersonV2ResponseDto> => {
    const headers = {
      'Content-Type': 'application/json',
      ...TokenService.getAuthHeader()
    };
    
    const response = await fetch(`${API_URL}/api/v2/PersonV2`, {
      method: 'POST',
      headers,
      body: JSON.stringify(personData)
    });

    return handleApiResponse<PersonV2ResponseDto>(response);
  },

  // Atualizar uma pessoa
  updatePerson: async (id: number, personData: PersonV2Dto): Promise<PersonV2ResponseDto> => {
    const headers = {
      'Content-Type': 'application/json',
      ...TokenService.getAuthHeader()
    };
    
    const response = await fetch(`${API_URL}/api/v2/PersonV2/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(personData)
    });

    return handleApiResponse<PersonV2ResponseDto>(response);
  },

  // Excluir uma pessoa
  deletePerson: async (id: number): Promise<void> => {
    const headers = {
      'Content-Type': 'application/json',
      ...TokenService.getAuthHeader()
    };
    
    const response = await fetch(`${API_URL}/api/v2/PersonV2/${id}`, {
      method: 'DELETE',
      headers
    });

    return handleApiResponse<void>(response);
  }
};

// Exportar o serviço de acordo com a versão da API
export const PersonService = API_VERSION === 'v2' ? PersonServiceV2 : PersonServiceV1;