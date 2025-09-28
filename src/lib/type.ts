export interface LoginFormState {
  email: string;
  password: string;
}

export interface RegisterFormState {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginApiResponse {
  token?: string;
  message?: string;
  user?: UserSafeData;
  error?: string;
}

export interface RegisterApiResponse {
  message?: string;
  user?: UserSafeData;
  error?: string;
}

export interface UserSafeData {
  id: string;
  email: string;
  name?: string | null;
}
