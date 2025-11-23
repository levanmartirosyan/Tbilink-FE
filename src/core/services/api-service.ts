import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ResetPasswordRequest,
  sendVerificationCodeRequest,
  SignInRequest,
  SingUpRequest,
  VerifyEmailRequest,
} from '../interfaces/auth-interfaces';
import { Enviroment } from '../../enviroment/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient, private apiUrl: Enviroment) {
    this.url = apiUrl.localUrl;
  }

  private url: string;

  signin(signinBody: SignInRequest) {
    return this.http.post(this.url + 'auth/signin', signinBody);
  }

  signup(signupBody: SingUpRequest) {
    return this.http.post(this.url + 'auth/signup', signupBody);
  }

  sendVerificationCode(sendVerificationCodeBody: sendVerificationCodeRequest) {
    return this.http.post(
      this.url + 'auth/send-verification-code',
      sendVerificationCodeBody
    );
  }

  verifyEmail(verifyEmailBody: VerifyEmailRequest) {
    return this.http.post(this.url + 'auth/verify-email', verifyEmailBody);
  }

  resetPassword(resetPasswordBody: ResetPasswordRequest) {
    return this.http.post(this.url + 'auth/reset-password', resetPasswordBody);
  }

  getUserData() {
    return this.http.get(this.url + 'user/me');
  }
}
