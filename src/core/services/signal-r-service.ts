import { Injectable, signal } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { User } from '../types/user';
import { Enviroment } from '../../enviroment/enviroment';
import { MessageDto } from '../interfaces/message-interface';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  constructor(private apiUrl: Enviroment) {
    this.hubUrl = this.apiUrl.hubUrlPublic;
  }

  /* ------------------ Presence hub ------------------ */
  hubConnection?: HubConnection;
  onlineUsers = signal<string[]>([]);

  private hubUrl: string;

  createHubConnection(user: User) {
    if (
      this.hubConnection &&
      this.hubConnection.state !== HubConnectionState.Disconnected
    ) {
      return;
    }

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'hubs/users', {
        accessTokenFactory: () => user.tokens.accessToken,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(console.log);

    this.hubConnection.off('UserOnline');
    this.hubConnection.on('UserOnline', (userId: string) => {
      this.onlineUsers.update((users) =>
        users.includes(userId) ? users : [...users, userId]
      );
    });

    this.hubConnection.off('UserOffline');
    this.hubConnection.on('UserOffline', (userId: string) => {
      this.onlineUsers.update((users) => users.filter((x) => x !== userId));
    });

    this.hubConnection.off('GetOnlineUsers');
    this.hubConnection.on('GetOnlineUsers', (userIds: string[]) => {
      this.onlineUsers.set(userIds);
    });
  }

  stopHubConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch(console.log);
      this.onlineUsers.set([]);
    }
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers().includes(userId.toString());
  }

  /* ------------------ Message hub ------------------ */
  messageHubConnection?: HubConnection;
  messages = signal<MessageDto[]>([]);
  private currentUserId: string | null = null;

  connectToMessageHub(user: User, otherUserId: number): void {
    if (!user) {
      console.error('No user provided');
      return;
    }

    this.currentUserId = user.data?.id;
    const url = `${this.hubUrl}hubs/messages?userId=${otherUserId}`;
    console.log('Connecting to message hub:', url);

    this.messageHubConnection = new HubConnectionBuilder()
      .withUrl(url, { accessTokenFactory: () => user.tokens.accessToken })
      .withAutomaticReconnect()
      .build();

    this.registerMessageHubEvents();

    this.messageHubConnection.start().catch((err) => {
      console.error('Failed to connect to message hub:', err);
    });
  }

  private registerMessageHubEvents(): void {
    if (!this.messageHubConnection) return;

    this.messageHubConnection.off('ReceiveMessageThread');
    this.messageHubConnection.on(
      'ReceiveMessageThread',
      (threadMessages: MessageDto[]) => {
        console.log('Received message thread:', threadMessages);
        if (Array.isArray(threadMessages)) {
          this.messages.set(threadMessages);
        }
      }
    );

    this.messageHubConnection.off('NewMessage');
    this.messageHubConnection.on('NewMessage', (message: MessageDto) => {
      console.log('New message received:', message);
      this.messages.update((prev) => [...prev, message]);
    });

    this.messageHubConnection.off('MessagesMarkedAsRead');
    this.messageHubConnection.on(
      'MessagesMarkedAsRead',
      (messageIds: number[]) => {
        this.messages.update((prev) =>
          prev.map((m) =>
            messageIds.includes(m.id)
              ? { ...m, dateRead: new Date().toISOString() }
              : m
          )
        );
      }
    );

    this.messageHubConnection.off('MessageEdited');
    this.messageHubConnection.on(
      'MessageEdited',
      (messageId: number, newContent: string) => {
        console.log('Message edited:', { messageId, newContent });
        this.messages.update((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, content: newContent } : m
          )
        );
      }
    );
  }

  disconnectFromMessageHub(): void {
    if (!this.messageHubConnection) return;
    this.messageHubConnection.stop().catch(console.error);
    this.messageHubConnection = undefined;
    this.messages.set([]);
  }

  sendMessage(recipientId: number, content: string): void {
    if (
      !this.messageHubConnection ||
      this.messageHubConnection.state !== HubConnectionState.Connected
    ) {
      console.error('Message hub not connected');
      return;
    }

    console.log('Sending message:', { recipientId, content });
    this.messageHubConnection
      .invoke('SendMessage', {
        recipientId,
        content,
      })
      .catch((err) => {
        console.error('Failed to send message:', err);
      });
  }

  editMessage(messageId: number, newContent: string): void {
    if (
      !this.messageHubConnection ||
      this.messageHubConnection.state !== HubConnectionState.Connected
    ) {
      console.error('Message hub not connected');
      return;
    }

    console.log('Editing message:', { messageId, newContent });
    this.messageHubConnection
      .invoke('EditMessage', {
        messageId: messageId,
        newContent: newContent,
      })
      .catch((err) => {
        console.error('Failed to edit message:', err);
      });
  }

  get currentThread() {
    return this.messages();
  }
}
