import { Component, OnDestroy, OnInit, effect } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Chat } from './messenger-components/chat/chat';
import { ChatArea } from './messenger-components/chat-area/chat-area';
import { ModalComponent } from '../../shared/modal/modal';
import { StartChatContent } from './messenger-components/start-chat-content/start-chat-content';
import { SignalRService } from '../../core/services/signal-r-service';
import { ApiService } from '../../core/services/api-service';
import { CommonService } from '../../core/services/common-service';
import { ChatParticipantDto } from '../../core/interfaces/message-interface';
import { SpinnerLoader } from '../../shared/loadings/spinner-loader/spinner-loader';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-messenger',
  imports: [
    LucideAngularModule,
    Chat,
    ChatArea,
    SpinnerLoader,
    ModalComponent,
    StartChatContent,
  ],
  templateUrl: './messenger.html',
  styleUrl: './messenger.scss',
})
export class Messenger implements OnInit, OnDestroy {
  public isStartChatModalOpen = false;
  openStartChatModal() {
    this.isStartChatModalOpen = true;
  }
  closeStartChatModal() {
    this.isStartChatModalOpen = false;
  }
  handleStartUser(user: any) {
    if (!user) return;

    this.selectChat([user as any]);
    this.closeStartChatModal();
    const currentUser = this.getUserFromCookie();
    if (currentUser) {
      this.signalRService.connectToMessageHubSilent(currentUser, user.id);
    }
  }
  constructor(
    public signalRService: SignalRService,
    private apiService: ApiService,
    private commonService: CommonService
  ) {
    effect(() => {
      const newMsg = this.signalRService.newMessageReceived();
      if (newMsg) {
        console.log('New message received, updating chat list:', newMsg);
        this.updateChatWithNewMessage(newMsg.message);
      }
    });

    effect(() => {
      const chatUpdate = this.signalRService.chatUpdates();
      if (chatUpdate) {
        console.log('Chat updated:', chatUpdate);
        this.updateChatData(chatUpdate);
      }
    });

    effect(() => {
      const notification = this.signalRService.newMessageNotification();
      if (notification) {
        console.log('New message notification received:', notification);
        this.updateChatWithNotification(notification);
      }
    });

    effect(() => {
      const readData = this.signalRService.messagesMarkedAsRead();
      if (readData) {
        console.log('Messages marked as read:', readData);
        const readByUserId = readData.ReadByUserId;
        const chatIndex = this.allChats.findIndex(
          (chat) => chat.participants[0].id === readByUserId
        );
        if (chatIndex !== -1) {
          this.allChats[chatIndex].unreadCount = 0;
          this.allChats = [...this.allChats];
        }
      }
    });

    effect(() => {
      const counts = this.signalRService.chatUnreadCounts();
      if (this.allChats.length > 0) {
        let updated = false;
        this.allChats.forEach((chat: any) => {
          const partnerId = chat.participants?.[0]?.id;
          if (partnerId) {
            const newCount = counts[partnerId] ?? 0;
            if (chat.unreadCount !== newCount) {
              chat.unreadCount = newCount;
              updated = true;
            }
          }
        });
        if (updated) {
          this.allChats = [...this.allChats];
          console.log('Updated chat unread counts from signal:', counts);
        }
      }
    });
  }

  onlineUserIds: any[] = [];
  ngOnInit() {
    setTimeout(() => {
      this.onlineUserIds = this.signalRService.onlineUsers();
      console.log('Currently online users:', this.onlineUserIds);
    }, 3000);

    this.getAllChats();
  }

  public isLoading: boolean = false;

  private getAllChats() {
    this.isLoading = true;
    this.apiService.getAllChats().subscribe({
      next: (data: any) => {
        this.allChats = data.data;
        console.log('All chats:', this.allChats);

        const currentCounts = this.signalRService.chatUnreadCounts();
        this.allChats.forEach((chat: any) => {
          const partnerId = chat.participants?.[0]?.id;
          if (partnerId && currentCounts[partnerId] !== undefined) {
            chat.unreadCount = currentCounts[partnerId];
          }
        });
        console.log('Current unread counts from signal:', currentCounts);

        if (this.allChats && this.allChats.length > 0) {
          const firstChatPartner = this.allChats[0].participants[0];

          if (firstChatPartner?.id) {
            setTimeout(() => {
              const user = this.getUserFromCookie();
              if (user) {
                console.log(
                  'Auto-connecting to first chat (silent):',
                  firstChatPartner.id
                );
                this.signalRService.connectToMessageHubSilent(
                  user,
                  firstChatPartner.id
                );
              }
            }, 500);
          }
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.log('Error fetching chats:', error);
        this.isLoading = false;
      },
    });
  }

  private getUserFromCookie() {
    const userCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('TB-UserData='));

    if (userCookie) {
      try {
        return JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
      } catch {
        return null;
      }
    }
    return null;
  }

  ngOnDestroy(): void {
    this.commonService.setChatSelectOption(false);
  }

  isUserOnline(userId: string): boolean {
    return this.signalRService.isUserOnline(userId);
  }

  public allChats: any[] = [];
  public currentOpenChatPartnerId: number | null = null;
  public selectedChatParticipants: ChatParticipantDto[] = [];
  public isChatSelected = false;

  selectChat(chat: ChatParticipantDto[]) {
    console.log(chat);

    const currentUserId = this.signalRService.currentThread;

    if (!chat || !Array.isArray(chat)) {
      this.selectedChatParticipants = [];
      this.currentOpenChatPartnerId = null;
      this.isChatSelected = false;
      return;
    }

    this.selectedChatParticipants = chat.filter(
      (participant: any) => participant.id !== currentUserId
    );

    if (this.selectedChatParticipants.length > 0) {
      this.currentOpenChatPartnerId = this.selectedChatParticipants[0].id;
      this.isChatSelected = true;
    } else {
      this.currentOpenChatPartnerId = null;
      this.isChatSelected = false;
    }

    this.commonService.setChatSelectOption(true);
    console.log(this.selectedChatParticipants);
  }

  onBackToList(): void {
    this.isChatSelected = false;
  }

  private updateChatWithNewMessage(message: any): void {
    const chatIndex = this.allChats.findIndex(
      (chat) =>
        chat.participants[0].id === message.senderId ||
        chat.participants[0].id === message.recipientId
    );

    if (chatIndex !== -1) {
      this.allChats[chatIndex].lastMessage = message;
      this.allChats[chatIndex].lastActivity = message.messageSent;

      const currentUserId = this.signalRService.currentThread;
      const messageSenderId = message.senderId;

      if (
        message.senderId !== currentUserId &&
        messageSenderId !== this.currentOpenChatPartnerId
      ) {
        const partnerId = message.senderId;
        this.allChats[chatIndex].unreadCount =
          (this.signalRService.chatUnreadCounts()?.[partnerId] ?? 0) + 1;
      }

      this.allChats = [...this.allChats];
    }
  }

  private updateChatData(chatUpdate: any): void {
    const chatIndex = this.allChats.findIndex(
      (chat) => chat.participants[0].id === chatUpdate.ChatPartnerId
    );

    if (chatIndex !== -1) {
      this.allChats[chatIndex].lastMessage = chatUpdate.LastMessage;
      this.allChats[chatIndex].lastActivity = chatUpdate.LastActivity;
      this.allChats[chatIndex].unreadCount = chatUpdate.UnreadCount;

      this.allChats = [...this.allChats];
    }
  }

  private updateChatWithNotification(notification: any): void {
    const chatIndex = this.allChats.findIndex(
      (chat) => chat.participants[0].id === notification.SenderId
    );

    if (chatIndex !== -1) {
      this.allChats[chatIndex].lastMessage = {
        id: notification.MessageId,
        senderId: notification.SenderId,
        senderName: notification.SenderName,
        content: notification.Message,
        messageSent: notification.Timestamp,
      };
      this.allChats[chatIndex].lastActivity = notification.Timestamp;

      if (notification.SenderId !== this.currentOpenChatPartnerId) {
        const currentCount =
          this.signalRService.chatUnreadCounts()?.[notification.SenderId] ?? 0;
        this.allChats[chatIndex].unreadCount = currentCount + 1;
      }

      this.allChats = [...this.allChats];
    }
  }
}
