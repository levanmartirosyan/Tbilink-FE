import { Injectable } from '@angular/core';
import { User } from '../types/user';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private cookies: CookieService) {
    const savedUser = cookies.get('TB-UserData');
    if (savedUser) {
      this.user.next(JSON.parse(savedUser));
    }
  }

  private user = new BehaviorSubject<User | null>(null);
  user$ = this.user.asObservable();

  public setUser(user: User | null): void {
    this.user.next(user);
    this.cookies.set('TB-UserData', JSON.stringify(user), {
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
    this.cookies.delete('TB-UserData', '/');
  }
}
