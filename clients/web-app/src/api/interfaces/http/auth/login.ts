export interface AuthLoginResponse {
  token: string;
  expiresAt: string;
}

export interface AuthLoginDTO {
  email: string;
  password: string;
}
