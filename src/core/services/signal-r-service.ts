import { Injectable, signal, computed } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { User } from '../types/user';
import { Enviroment } from '../../enviroment/enviroment';
import { MessageDto } from '../interfaces/message-interface';
import { AudioNotificationService } from './audio-notification-service';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {
  constructor(
    private apiUrl: Enviroment,
    private audioNotification: AudioNotificationService
  ) {
    this.hubUrl = this.apiUrl.hubUrlLocal;
  }

  /* ------------------ Presence hub ------------------ */
  hubConnection?: HubConnection;
  onlineUsers = signal<string[]>([]);
  lastActiveUsers = signal<Record<string, Date>>({});

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
      this.lastActiveUsers.update((prev) => ({
        ...prev,
        [userId]: new Date(),
      }));
    });

    this.hubConnection.off('GetOnlineUsers');
    this.hubConnection.on('GetOnlineUsers', (userIds: string[]) => {
      this.onlineUsers.set(userIds);
    });

    this.hubConnection.off('ChatUpdated');
    this.hubConnection.on('ChatUpdated', (data: any) => {
      console.log('>>> ChatUpdated from presence hub:', data);

      const chatPartnerId = data.chatPartnerId || data.ChatPartnerId;
      const lastMessageId = data.lastMessage?.id || data.LastMessage?.Id;

      const isViewingThisChat =
        this.isActivelyViewingChat() &&
        this.currentOpenChatPartnerId() === chatPartnerId;

      if (chatPartnerId && !isViewingThisChat) {
        if (lastMessageId && !this.processedMessageIds.has(lastMessageId)) {
          this.processedMessageIds.add(lastMessageId);
          if (this.processedMessageIds.size > 100) {
            const first = this.processedMessageIds.values().next().value;
            if (first) this.processedMessageIds.delete(first);
          }

          this.incrementUnreadCount(chatPartnerId);
          console.log(
            'Incremented unread count for chat:',
            chatPartnerId,
            'messageId:',
            lastMessageId
          );

          if (!this.soundPlayedForMessageIds.has(lastMessageId)) {
            this.soundPlayedForMessageIds.add(lastMessageId);
            if (this.soundPlayedForMessageIds.size > 100) {
              const first = this.soundPlayedForMessageIds.values().next().value;
              if (first) this.soundPlayedForMessageIds.delete(first);
            }
            console.log('>>> Playing notification sound (ChatUpdated)');
            this.audioNotification.playNotificationSound();
          }
        }
      }

      this.chatUpdates.set({
        ...data,
        timestamp: new Date().getTime(),
      });
    });

    this.hubConnection.off('ChatUnreadCountUpdated');
    this.hubConnection.on(
      'ChatUnreadCountUpdated',
      (data: { ChatPartnerId: number; UnreadCount: number }) => {
        console.log('Chat unread count updated from presence hub:', data);
        this.updateUnreadCount(data.ChatPartnerId, data.UnreadCount);
      }
    );

    this.hubConnection.off('NewMessageReceived');
    this.hubConnection.on('NewMessageReceived', (notification: any) => {
      console.log('New message notification received:', notification);

      const senderId = notification.SenderId || notification.senderId;
      const messageId =
        notification.MessageId ||
        notification.messageId ||
        notification.Id ||
        notification.id;

      const isViewingThisChat =
        this.isActivelyViewingChat() &&
        this.currentOpenChatPartnerId() === senderId;

      if (messageId && !this.soundPlayedForMessageIds.has(messageId)) {
        this.soundPlayedForMessageIds.add(messageId);

        if (this.soundPlayedForMessageIds.size > 100) {
          const first = this.soundPlayedForMessageIds.values().next().value;
          if (first) this.soundPlayedForMessageIds.delete(first);
        }
        console.log(
          'Playing notification sound for new message (presence hub)'
        );
        this.audioNotification.playNotificationSound();
      }

      if (senderId && !isViewingThisChat) {
        if (messageId && !this.processedMessageIds.has(messageId)) {
          this.processedMessageIds.add(messageId);

          if (this.processedMessageIds.size > 100) {
            const first = this.processedMessageIds.values().next().value;
            if (first) this.processedMessageIds.delete(first);
          }
          this.incrementUnreadCount(senderId);
          console.log(
            'Incremented unread count for sender:',
            senderId,
            'messageId:',
            messageId
          );
        }
      }

      this.newMessageNotification.set({
        ...notification,
        timestamp: new Date().getTime(),
      });
    });

    this.hubConnection.off('NotificationReceived');
    this.hubConnection.on('NotificationReceived', (notification: any) => {
      console.log('Notification received:', notification);
    });

    this.hubConnection.off('MessagesMarkedAsRead');
    this.hubConnection.on('MessagesMarkedAsRead', (data: any) => {
      console.log('MessagesMarkedAsRead from presence hub:', data);
      const messageIds = data.MessageIds || data.messageIds || [];
      const readByUserId = data.ReadByUserId || data.readByUserId;

      this.messages.update((prev) =>
        prev.map((m) =>
          messageIds.includes(m.id)
            ? { ...m, dateRead: new Date().toISOString() }
            : m
        )
      );
      this.messagesMarkedAsRead.set(data);
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

  getUserLastActive(userId: string): Date | null {
    if (this.isUserOnline(userId)) {
      return null;
    }
    return this.lastActiveUsers()[userId.toString()] || null;
  }

  /* ------------------ Message hub ------------------ */
  messageHubConnection?: HubConnection;
  messages = signal<MessageDto[]>([]);
  typingUsers = signal<Record<string, boolean>>({});
  chatUpdates = signal<any>(null);
  newMessageReceived = signal<any>(null);
  newMessageNotification = signal<any>(null);
  messagesMarkedAsRead = signal<any>(null);

  currentOpenChatPartnerId = signal<number | null>(null);

  isActivelyViewingChat = signal<boolean>(false);

  private processedMessageIds = new Set<number>();
  private soundPlayedForMessageIds = new Set<number>();

  private readonly UNREAD_COUNTS_KEY = 'TB-UnreadCounts';

  chatUnreadCounts = signal<Record<number, number>>(
    this.loadUnreadCountsFromStorage()
  );

  totalUnreadCount = computed(() => {
    const counts = this.chatUnreadCounts();
    return Object.values(counts).reduce((sum, count) => sum + count, 0);
  });

  private loadUnreadCountsFromStorage(): Record<number, number> {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(this.UNREAD_COUNTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Loaded unread counts from storage:', parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load unread counts from storage:', e);
    }
    return {};
  }

  saveUnreadCountsToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const counts = this.chatUnreadCounts();
      localStorage.setItem(this.UNREAD_COUNTS_KEY, JSON.stringify(counts));
      console.log('Saved unread counts to storage:', counts);
    } catch (e) {
      console.error('Failed to save unread counts to storage:', e);
    }
  }

  updateUnreadCount(partnerId: number, count: number): void {
    this.chatUnreadCounts.update((prev) => {
      const updated = { ...prev };
      if (count > 0) {
        updated[partnerId] = count;
      } else {
        delete updated[partnerId];
      }
      return updated;
    });
    this.saveUnreadCountsToStorage();
  }

  incrementUnreadCount(partnerId: number): void {
    this.chatUnreadCounts.update((prev) => ({
      ...prev,
      [partnerId]: (prev[partnerId] ?? 0) + 1,
    }));
    this.saveUnreadCountsToStorage();
  }

  clearUnreadCount(partnerId: number): void {
    console.log('clearUnreadCount called for partnerId:', partnerId);
    this.chatUnreadCounts.update((prev) => {
      const updated = { ...prev };
      delete updated[partnerId];
      console.log('Updated unread counts after clear:', updated);
      return updated;
    });
    this.saveUnreadCountsToStorage();
  }

  setUnreadCounts(counts: Record<number, number>): void {
    const existing = this.chatUnreadCounts();
    const merged: Record<number, number> = { ...existing };

    Object.entries(counts).forEach(([partnerId, count]) => {
      const id = Number(partnerId);
      if (count > 0) {
        merged[id] = count;
      }
    });

    this.chatUnreadCounts.set(merged);
    this.saveUnreadCountsToStorage();
    console.log('Merged unread counts:', merged);
  }

  private currentUserId: string | null = null;

  private typingTimers = new Map<number, any>();
  private readonly TYPING_STOP_DEBOUNCE_MS = 3000;

  connectToMessageHubSilent(user: User, otherUserId: number): void {
    if (!user) {
      console.error('No user provided');
      return;
    }

    this.currentUserId = user.data?.id;
    this.currentOpenChatPartnerId.set(otherUserId);

    const url = `${this.hubUrl}hubs/messages?userId=${otherUserId}`;
    console.log('Connecting to message hub (silent):', url);

    this.messageHubConnection = new HubConnectionBuilder()
      .withUrl(url, { accessTokenFactory: () => user.tokens.accessToken })
      .withAutomaticReconnect()
      .build();

    this.registerMessageHubEvents();

    this.messageHubConnection
      .start()
      .then(() => {
        console.log(
          'Message hub connected (silent mode - not marking as read)'
        );
      })
      .catch((err) => {
        console.error('Failed to connect to message hub:', err);
      });
  }

  connectToMessageHub(user: User, otherUserId: number): void {
    if (!user) {
      console.error('No user provided');
      return;
    }

    this.currentUserId = user.data?.id;
    this.currentOpenChatPartnerId.set(otherUserId);
    this.isActivelyViewingChat.set(true);

    this.clearUnreadCount(otherUserId);

    const url = `${this.hubUrl}hubs/messages?userId=${otherUserId}`;
    console.log('Connecting to message hub:', url);

    this.messageHubConnection = new HubConnectionBuilder()
      .withUrl(url, { accessTokenFactory: () => user.tokens.accessToken })
      .withAutomaticReconnect()
      .build();

    this.registerMessageHubEvents();

    this.messageHubConnection
      .start()
      .then(() => {
        console.log('Message hub connected, marking messages as read');
        this.markMessagesAsRead(otherUserId);
      })
      .catch((err) => {
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
          threadMessages.forEach((m) => {
            console.log(
              `Message ${m.id} from ${m.senderId}: dateRead = ${m.dateRead}`
            );
          });
          this.messages.set(threadMessages);
        }
      }
    );

    this.messageHubConnection.off('NewMessage');
    this.messageHubConnection.on('NewMessage', (message: MessageDto) => {
      console.log('>>> NewMessage event fired:', message);
      console.log(`>>> NewMessage dateRead: ${message.dateRead}`);

      // Deduplicate: only add if message with this ID doesn't already exist
      this.messages.update((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) {
          console.log(
            `Message ${message.id} already exists, skipping duplicate`
          );
          return prev;
        }
        return [...prev, message];
      });

      // Play notification sound if current user is the RECIPIENT (sender is NOT current user)
      if (message.senderId && this.currentUserId) {
        const currentUserIdNum = parseInt(this.currentUserId, 10);
        const isRecipient = message.senderId !== currentUserIdNum;

        if (isRecipient && !this.soundPlayedForMessageIds.has(message.id)) {
          this.soundPlayedForMessageIds.add(message.id);
          if (this.soundPlayedForMessageIds.size > 100) {
            const first = this.soundPlayedForMessageIds.values().next().value;
            if (first) this.soundPlayedForMessageIds.delete(first);
          }
          console.log('>>> Playing notification sound (message hub)');
          this.audioNotification.playNotificationSound();
        }
      }

      this.newMessageReceived.set({
        message: message,
        timestamp: new Date().getTime(),
      });
    });

    this.messageHubConnection.off('MessagesMarkedAsRead');
    this.messageHubConnection.on('MessagesMarkedAsRead', (data: any) => {
      console.log('MessagesMarkedAsRead from message hub:', data);
      const messageIds = data.MessageIds || data.messageIds || [];
      const readByUserId = data.ReadByUserId || data.readByUserId;
      console.log(
        `MessagesMarkedAsRead - IDs: ${messageIds}, readBy: ${readByUserId}`
      );

      this.messages.update((prev) =>
        prev.map((m) => {
          if (messageIds.includes(m.id)) {
            console.log(`Marking message ${m.id} as read`);
            return { ...m, dateRead: new Date().toISOString() };
          }
          return m;
        })
      );
      this.messagesMarkedAsRead.set(data);
    });

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

    this.messageHubConnection.off('UserTyping');
    this.messageHubConnection.on('UserTyping', (payload: any) => {
      try {
        const userId = String(
          payload?.UserId ?? payload?.userId ?? payload?.user?.id ?? ''
        );
        const isTyping = !!(payload?.IsTyping ?? payload?.isTyping);

        if (!userId) return;

        this.typingUsers.update((map) => ({
          ...(map || {}),
          [userId]: isTyping,
        }));
      } catch (e) {
        console.warn('Invalid UserTyping payload', payload, e);
      }
    });
  }

  disconnectFromMessageHub(): void {
    if (!this.messageHubConnection) return;

    this.typingTimers.forEach((t) => clearTimeout(t));
    this.typingTimers.clear();
    this.typingUsers.set({});
    this.currentOpenChatPartnerId.set(null);
    this.isActivelyViewingChat.set(false);

    this.messageHubConnection.stop().catch(console.error);
    this.messageHubConnection = undefined;
    this.messages.set([]);
  }

  connectToMultipleMessageHubs(user: User, chatPartnerIds: number[]): void {
    if (!user || !chatPartnerIds || chatPartnerIds.length === 0) {
      console.warn('No chat partners provided for message hub connections');
      return;
    }

    if (chatPartnerIds.length > 0) {
      this.connectToMessageHub(user, chatPartnerIds[0]);
    }
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

  markMessagesAsRead(otherUserId: number): void {
    if (
      !this.messageHubConnection ||
      this.messageHubConnection.state !== HubConnectionState.Connected
    ) {
      console.error('Message hub not connected');
      return;
    }

    console.log('Marking messages as read for user:', otherUserId);

    this.clearUnreadCount(otherUserId);

    const messagesToMarkAsRead = this.messages()
      .filter((m) => m.senderId === otherUserId && !m.dateRead)
      .map((m) => m.id);

    console.log('Messages to mark as read:', messagesToMarkAsRead);

    // This updates our local view
    this.messages.update((prev) =>
      prev.map((m) =>
        m.senderId === otherUserId && !m.dateRead
          ? { ...m, dateRead: new Date().toISOString() }
          : m
      )
    );

    // Backend should notify the SENDER so they see "Seen" on their end
    this.messageHubConnection
      .invoke('MarkMessagesAsRead', otherUserId)
      .then(() => {
        console.log('Successfully marked messages as read on backend');
      })
      .catch((err) => {
        console.error('Failed to mark messages as read:', err);
      });
  }

  get currentThread() {
    return this.messages();
  }

  startTyping(recipientId: number): void {
    if (
      !this.messageHubConnection ||
      this.messageHubConnection.state !== HubConnectionState.Connected
    ) {
      return;
    }

    this.messageHubConnection
      .invoke('TypingStarted', recipientId)
      .catch((err) => console.warn('TypingStarted invoke failed', err));

    this.scheduleStopTyping(recipientId);
  }

  stopTyping(recipientId: number): void {
    if (
      !this.messageHubConnection ||
      this.messageHubConnection.state !== HubConnectionState.Connected
    ) {
      return;
    }

    const timer = this.typingTimers.get(recipientId);
    if (timer) {
      clearTimeout(timer);
      this.typingTimers.delete(recipientId);
    }

    this.messageHubConnection
      .invoke('TypingStopped', recipientId)
      .catch((err) => console.warn('TypingStopped invoke failed', err));
  }

  private scheduleStopTyping(recipientId: number) {
    const existing = this.typingTimers.get(recipientId);
    if (existing) {
      clearTimeout(existing);
    }

    const t = setTimeout(() => {
      if (
        this.messageHubConnection &&
        this.messageHubConnection.state === HubConnectionState.Connected
      ) {
        this.messageHubConnection
          .invoke('TypingStopped', recipientId)
          .catch((err) => console.warn('TypingStopped invoke failed', err));
      }
      this.typingTimers.delete(recipientId);
    }, this.TYPING_STOP_DEBOUNCE_MS);

    this.typingTimers.set(recipientId, t);
  }

  isUserTyping(userId: number | string): boolean {
    const key = String(userId ?? '');
    return !!this.typingUsers()?.[key];
  }

  /* ---- Audio Notification Methods ---- */

  toggleNotificationSound(): void {
    this.audioNotification.toggleMute();
  }

  isNotificationSoundMuted(): boolean {
    return this.audioNotification.isSoundMuted();
  }

  setNotificationSoundMuted(muted: boolean): void {
    this.audioNotification.setMuted(muted);
  }
}
