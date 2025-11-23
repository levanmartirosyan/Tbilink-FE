export interface SignInRequest {
  email: string;
  password: string;
}

export interface SingUpRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  repPassword: string;
}

export interface sendVerificationCodeRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  code: string;
  email: string;
  password: string;
  repPassword: string;
}
