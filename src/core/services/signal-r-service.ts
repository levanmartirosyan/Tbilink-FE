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
      .withUrl(this.apiUrl.hubUrlLocal, {
        accessTokenFactory: () => user.tokens.accessToken,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((error) => console.log(error));

    this.hubConnection.off('UserOnline');
    this.hubConnection.on('UserOnline', (userId) => {
      this.onlineUsers.update((users) => [...users, userId]);
    });

    this.hubConnection.off('UserOffline');
    this.hubConnection.on('UserOffline', (userId) => {
      this.onlineUsers.update((users) => users.filter((x) => x !== userId));
    });

    this.hubConnection.off('GetOnlineUsers');
    this.hubConnection.on('GetOnlineUsers', (userIds) => {
      this.onlineUsers.set(userIds);
    });
  }

  stopHubConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch((err) => console.log(err));
      this.onlineUsers.set([]);
    }
  }

  isUserOnline(userId: string): boolean {
    const currentUserId = userId.toString();
    const online = this.onlineUsers().includes(currentUserId || '');
    return online;
  }
}
