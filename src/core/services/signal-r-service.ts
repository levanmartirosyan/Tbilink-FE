import { Injectable, signal } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { User } from '../types/user';
import { Enviroment } from '../../enviroment/enviroment';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  constructor(private apiUrl: Enviroment) {}

  hubConnection?: HubConnection;
  onlineUsers = signal<string[]>([]);

  createHubConnection(user: User) {
    console.log('Creating hub connection for user', user?.data?.id);
    if (
      this.hubConnection &&
      this.hubConnection.state !== HubConnectionState.Disconnected
    ) {
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.apiUrl.hubUrlPublic, {
        accessTokenFactory: () => user.tokens.accessToken,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((error: any) => console.log(error));

    this.hubConnection.off('UserOnline');
    this.hubConnection.on('UserOnline', (userId: string) => {
      this.onlineUsers.update((users: string[]) => [...users, userId]);
    });

    this.hubConnection.off('UserOffline');
    this.hubConnection.on('UserOffline', (userId: string) => {
      this.onlineUsers.update((users: string[]) =>
        users.filter((x: string) => x !== userId)
      );
    });

    this.hubConnection.off('GetOnlineUsers');
    this.hubConnection.on('GetOnlineUsers', (userIds: string[]) => {
      this.onlineUsers.set(userIds);
    });
  }

  stopHubConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch((err: any) => console.log(err));
      this.onlineUsers.set([]);
    }
  }

  isUserOnline(userId: string): boolean {
    const currentUserId = userId.toString();
    const online = this.onlineUsers().includes(currentUserId || '');
    return online;
  }
}
