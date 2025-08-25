import { api } from "..";
import type {
  AuthLoginDTO,
  AuthLoginResponse,
} from "../interfaces/http/auth/login";
import type { User } from "../interfaces/user";

export const validateSession = async (token?: string) => {
  return api
    .get<User>("auth/validate", {
      headers: token ? { authorization: `Bearer ${token}` } : undefined,
    })
    .then((response) => response.data);
};

export const login = async (dto: AuthLoginDTO) => {
  return api
    .post<AuthLoginResponse>("auth/login", dto)
    .then((response) => response.data);
};
