import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

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
}
