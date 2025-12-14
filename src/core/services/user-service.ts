import { Injectable } from '@angular/core';
import { User } from '../types/user';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { SignalRService } from './signal-r-service';
import { HttpClient } from '@angular/common/http';
import { env } from '../../enviroment/enviroment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USER_COOKIE_KEY = 'TB-UserData';

  constructor(
    private cookies: CookieService,
    private signalRService: SignalRService,
    private http: HttpClient
  ) {
    const savedUser = cookies.get(this.USER_COOKIE_KEY);
    if (savedUser) {
      try {
        this.user.next(JSON.parse(savedUser));
        this.signalRService.createHubConnection(this.user.value!);
        this.fetchInitialUnreadCounts();
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

    if (user) {
      this.signalRService.createHubConnection(user);
      this.fetchInitialUnreadCounts();
    }
  }

  public updateUserData(newData: Partial<User['data']>): void {
    const currentUser = this.user.value;
    if (!currentUser) return;

    const updatedUser: User = {
      ...currentUser,
      data: {
        ...currentUser.data,
        ...newData,
      },
    };

    this.user.next(updatedUser);
    this.cookies.set(this.USER_COOKIE_KEY, JSON.stringify(updatedUser), {
      expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      secure: true,
      sameSite: 'Strict',
      path: '/',
    });
  }

  private fetchInitialUnreadCounts(): void {
    this.http.get<any>(env.publicUrl + 'message/chats').subscribe({
      next: (response: any) => {
        if (response?.data) {
          const unreadCounts: Record<number, number> = {};
          response.data.forEach((chat: any) => {
            const partnerId = chat.participants?.[0]?.id;
            if (partnerId && chat.unreadCount > 0) {
              unreadCounts[partnerId] = chat.unreadCount;
            }
          });
          if (Object.keys(unreadCounts).length > 0) {
            this.signalRService.setUnreadCounts(unreadCounts);
            console.log('Initial unread counts loaded from API:', unreadCounts);
          } else {
            console.log(
              'API returned no unread counts, keeping localStorage data'
            );
          }
        }
      },
      error: (err) =>
        console.error('Failed to fetch initial unread counts:', err),
    });
  }

  public getUser(): User | null {
    return this.user.value;
  }

  public logout(): void {
    this.user.next(null);
    this.cookies.delete(this.USER_COOKIE_KEY, '/');

    localStorage.removeItem('TB-UnreadCounts');

    this.signalRService.stopHubConnection();
  }

  public isAdmin(): boolean {
    const currentUser = this.user.value;
    return (
      currentUser?.data?.role === 'Admin' || currentUser?.data?.role === 'Owner'
    );
  }
}
