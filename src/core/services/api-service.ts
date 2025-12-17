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
import { Observable } from 'rxjs';
import { ServiceResponse } from '../interfaces/Response';
import { SendMessageRequest } from '../interfaces/message-interface';
import { IPost } from '../interfaces/IPost';
import { env } from '../../enviroment/enviroment';
import { UpdateUser } from '../interfaces/user-interface';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  private url: string = env.publicUrl;

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

  updateUser(targetUserId: string, userBody: UpdateUser) {
    return this.http.put(this.url + `user/update/${targetUserId}`, userBody);
  }

  removeUser(userId: string) {
    return this.http.delete(this.url + `user/remove/${userId}`);
  }

  uploadPublicFile(formData: FormData, folder: string) {
    formData.append('Folder', folder);

    return this.http.post(this.url + 'storage/upload/public', formData);
  }

  uploadPrivateFile(formData: FormData, folder: string) {
    formData.append('Folder', folder);

    return this.http.post(this.url + 'storage/upload/private', formData);
  }

  deleteFileFromPublic(filePath: string) {
    return this.http.delete(
      this.url + `storage/object?bucket=Tbilink-Public&path=${filePath}`
    );
  }

  getSignedUrl(filePath: string) {
    return this.http.post(this.url + 'storage/get-signed-url', { filePath });
  }

  getAllPosts() {
    return this.http.get<ServiceResponse<IPost[]>>(this.url + 'post/all');
  }

  getAllPostsPaginated(
    pageNumber: number = 1,
    pageSize: number = 5
  ): Observable<ServiceResponse<IPost[]>> {
    return this.http.get<ServiceResponse<IPost[]>>(
      this.url +
        `post/all/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }

  getPostsByUserId(userId?: string) {
    return this.http.get<ServiceResponse<IPost[]>>(
      this.url + `post/user/${userId}`
    );
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

  likePost(postId: string) {
    return this.http.post(this.url + `post/${postId}/like`, {});
  }

  sendMessage(messageBody: SendMessageRequest) {
    return this.http.post(this.url + 'message/send', messageBody);
  }

  getMessageThread(recipientId: number) {
    return this.http.get(this.url + `message/thread/${recipientId}`);
  }

  getAllChats() {
    return this.http.get(this.url + 'message/chats');
  }

  deleteMessage(messageId: number) {
    return this.http.delete(this.url + `message/delete/${messageId}`);
  }

  // Comment endpoints
  getPostComments(postId: string) {
    return this.http.get(this.url + `post/${postId}/comments`);
  }

  createComment(postId: string, content: string) {
    return this.http.post(this.url + `post/${postId}/comments/create`, {
      content,
    });
  }

  updateComment(commentId: string, content: string) {
    return this.http.put(this.url + `post/comments/${commentId}/update`, {
      content,
    });
  }

  deleteComment(commentId: string) {
    return this.http.delete(this.url + `post/comments/${commentId}/delete`);
  }

  likeComment(commentId: string) {
    return this.http.post(this.url + `post/comments/${commentId}/like`, {});
  }

  getUserByUsername(username: string) {
    return this.http.get(this.url + `user/${username}`);
  }

  toggleFollowUser(targetUserId: string) {
    return this.http.post(this.url + `user/follow/${targetUserId}`, {});
  }

  getUserFollowers(targetUserId: string) {
    return this.http.get(this.url + `user/${targetUserId}/followers`);
  }

  getUserFollowing(targetUserId: string) {
    return this.http.get(this.url + `user/${targetUserId}/following`);
  }

  getMutualFollowers() {
    return this.http.get(this.url + `user/mutual-followers`);
  }

  getFollowStats(targetUserId: string) {
    return this.http.get(this.url + `user/${targetUserId}/follow-stats`);
  }

  search(
    keyword: string,
    category: string = 'all',
    page: number = 1,
    pageSize: number = 10
  ) {
    const keywordParam = encodeURIComponent(keyword.trim().toLowerCase());
    const categoryParam = encodeURIComponent(category.trim().toLowerCase());
    return this.http.get(
      this.url +
        `search?${
          keywordParam !== '' ? `keyword=${keywordParam}&` : ''
        }category=${categoryParam}&page=${page}&pageSize=${pageSize}`
    );
  }

  changePassword(changePasswordBody: any) {
    return this.http.post(
      this.url + 'user/change-password',
      changePasswordBody
    );
  }
}
