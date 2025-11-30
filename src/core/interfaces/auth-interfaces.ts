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

export interface SignInResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
  data: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    profilePhotoUrl: string;
    role: string;
    isEmailVerified: boolean;
  };
}

export interface SingUpResponse {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  repPassword: string;
}

export interface sendVerificationCodeResponse {
  email: string;
}

export interface VerifyEmailResponse {
  email: string;
  code: string;
}

export interface ResetPasswordResponse {
  code: string;
  email: string;
  password: string;
  repPassword: string;
}
