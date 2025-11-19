import { Injectable } from '@angular/core';
import { User } from '../types/user';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor() {
    const savedUser = window.localStorage.getItem('user');
    if (savedUser) {
      this.user.next(JSON.parse(savedUser));
    }
  }

  private user = new BehaviorSubject<User | null>(null);
  user$ = this.user.asObservable();

  public setUser(user: User | null): void {
    this.user.next(user);
    window.localStorage.setItem('user', JSON.stringify(user));
  }

  public getUser(): User | null {
    return this.user.value;
  }

  public logout(): void {
    this.user.next(null);
    window.localStorage.removeItem('user');
  }
}
