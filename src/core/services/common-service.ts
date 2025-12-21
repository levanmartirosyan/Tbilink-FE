import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ChatParticipantDto } from '../interfaces/message-interface';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private authActionSubject = new BehaviorSubject<string>('');
  authAction$ = this.authActionSubject.asObservable();

  setAuthAction(action: string) {
    this.authActionSubject.next(action);
  }

  private verifyEmail = new BehaviorSubject<{ type: string; email: string }>({
    type: '',
    email: '',
  });
  verifyEmail$ = this.verifyEmail.asObservable();

  setRecEmail(formAction: any) {
    this.verifyEmail.next(formAction);
  }

  private isEmailVerified = new BehaviorSubject<boolean>(false);
  isEmailVerified$ = this.isEmailVerified.asObservable();

  setIsEmailVerified(response: boolean) {
    this.isEmailVerified.next(response);
  }

  private userEmailExists = new BehaviorSubject<boolean>(false);
  userEmailExists$ = this.userEmailExists.asObservable();

  setUserEmailExists(response: boolean) {
    this.userEmailExists.next(response);
  }

  private showLoader = new Subject<boolean>();
  showLoader$ = this.showLoader.asObservable();

  setShowLoader(value: boolean) {
    this.showLoader.next(value);
  }

  private setSegmentedSwitcherOption = new BehaviorSubject<string>('option1');
  setSegmentedSwitcherOption$ = this.setSegmentedSwitcherOption.asObservable();

  setSwitcherotion(value: string) {
    this.setSegmentedSwitcherOption.next(value);
  }

  private ChatSelectOption = new BehaviorSubject<boolean>(false);
  ChatSelectOption$ = this.ChatSelectOption.asObservable();

  setChatSelectOption(value: boolean) {
    this.ChatSelectOption.next(value);
  }

  private profileUserData = new BehaviorSubject<any>(null);
  profileUserData$ = this.profileUserData.asObservable();

  setProfileUserData(userData: any) {
    this.profileUserData.next(userData);
  }

  getProfileUserData() {
    return this.profileUserData.asObservable();
  }

  private userPostData = new BehaviorSubject<any>(null);
  userPostData$ = this.userPostData.asObservable();

  setUserPostData(userData: any) {
    this.userPostData.next(userData);
  }

  getUserPostData() {
    return this.userPostData.asObservable();
  }

  private searchData = new BehaviorSubject<any>(null);
  searchData$ = this.searchData.asObservable();

  setSearchData(data: any) {
    this.searchData.next(data);
  }

  getSearchData() {
    return this.searchData.asObservable();
  }

  private searchKeyword = new BehaviorSubject<string>('');
  searchKeyword$ = this.searchKeyword.asObservable();

  setSearchKeyword(keyword: string) {
    this.searchKeyword.next(keyword);
  }

  getSearchKeyword() {
    return this.searchKeyword.asObservable();
  }

  private chatRecipientId = new BehaviorSubject<ChatParticipantDto | null>(
    null
  );
  chatRecipientId$ = this.chatRecipientId.asObservable();

  setChatRecipientId(user: ChatParticipantDto | null) {
    this.chatRecipientId.next(user);
  }

  getChatRecipientId() {
    return this.chatRecipientId.asObservable();
  }

  private currentRoute = new BehaviorSubject<string>('');
  currentRoute$ = this.currentRoute.asObservable();

  setCurrentRoute(route: string) {
    this.currentRoute.next(route);
  }

  getCurrentRoute() {
    return this.currentRoute.asObservable();
  }
}
