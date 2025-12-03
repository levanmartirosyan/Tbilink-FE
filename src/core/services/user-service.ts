import { Injectable } from '@angular/core';
import { User } from '../types/user';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { SignalRService } from './signal-r-service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USER_COOKIE_KEY = 'TB-UserData';

  constructor(
    private cookies: CookieService,
    private signalRService: SignalRService
  ) {
    const savedUser = cookies.get(this.USER_COOKIE_KEY);
    if (savedUser) {
      try {
        this.user.next(JSON.parse(savedUser));
        this.signalRService.createHubConnection(this.user.value!);
      } catch {
        this.cookies.delete(this.USER_COOKIE_KEY, '/');
        this.user.next(null);
      }
    }
  }

  private user = new BehaviorSubject<User | null>(null);
  user$ = this.user.asObservable();

  public setUser(user: User | null): void {
    this.user.next(user);
    this.cookies.set(this.USER_COOKIE_KEY, JSON.stringify(user), {
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      secure: true,
      sameSite: 'Strict',
      path: '/',
    });
  }

  public getUser(): User | null {
    return this.user.value;
  }

  public logout(): void {
    this.user.next(null);
    this.cookies.delete(this.USER_COOKIE_KEY, '/');

    this.signalRService.stopHubConnection();
  }
}
