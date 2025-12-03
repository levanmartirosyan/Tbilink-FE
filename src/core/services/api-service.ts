import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ResetPasswordRequest,
  sendVerificationCodeRequest,
  SignInRequest,
  SignInResponse,
  SingUpRequest,
  VerifyEmailRequest,
} from '../interfaces/auth-interfaces';
import { Enviroment } from '../../enviroment/enviroment';
import { Observable } from 'rxjs';
import { ServiceResponse } from '../interfaces/Response';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient, private apiUrl: Enviroment) {
    this.url = apiUrl.localUrl;
  }

  private url: string;

  signin(
    signinBody: SignInRequest
  ): Observable<ServiceResponse<SignInResponse>> {
    return this.http.post<ServiceResponse<SignInResponse>>(
      this.url + 'auth/signin',
      signinBody
    );
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

  uploadPublicFile(formData: FormData, folder: string) {
    formData.append('Folder', folder);

    return this.http.post(this.url + 'storage/upload/public', formData);
  }

  getAllPosts() {
    return this.http.get(this.url + 'post/all');
  }

  getPostById(postId: string) {
    return this.http.get(this.url + 'post?postId=' + postId);
  }

  createPost(postBody: any) {
    return this.http.post(this.url + 'post/create', postBody);
  }

  updatePost(postBody: any) {
    return this.http.put(this.url + 'post/update', postBody);
  }

  deletePost(postId: string) {
    return this.http.delete(this.url + 'post/delete?postId=' + postId);
  }
}
