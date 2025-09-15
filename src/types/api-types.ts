// Tipos para autenticação
export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  username: string;
  email: string;
  expiresAt: string;
}

export interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  isActive: boolean;
}

// Tipos para Pessoa
export interface PersonDto {
  nome: string;
  sexo?: string;
  email?: string;
  dataNascimento: string;
  naturalidade?: string;
  nacionalidade?: string;
  cpf: string;
}

export interface EnderecoDto {
  rua: string;
  numero: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface PersonV2Dto extends PersonDto {
  endereco: EnderecoDto;
}

export interface PersonResponseDto extends PersonDto {
  id: number;
  dataCadastro: string;
  dataAtualizacao: string;
}

export interface PersonV2ResponseDto extends PersonV2Dto {
  id: number;
  dataCadastro: string;
  dataAtualizacao: string;
}

// Tipos para Erros
export interface ApiErrorDto {
  error: {
    message: string;
    statusCode: number;
  };
}