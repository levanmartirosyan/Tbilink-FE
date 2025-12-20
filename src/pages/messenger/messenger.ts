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
import { UserService } from '../../core/services/user-service';
import { take } from 'rxjs';

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
  }
  constructor(
    public signalRService: SignalRService,
    private apiService: ApiService,
    private commonService: CommonService,
    private userService: UserService
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
        const messageIds: any[] =
          readData.MessageIds || readData.messageIds || [];

        this.allChats.forEach((chat: any) => {
          const partnerId = chat.participants?.[0]?.id;
          if (partnerId && String(partnerId) === String(readByUserId)) {
            chat.unreadCount = 0;
          }

          if (chat.lastMessage && messageIds && messageIds.length > 0) {
            const lastMsgId = chat.lastMessage.id;
            if (lastMsgId && messageIds.includes(lastMsgId)) {
              chat.lastMessage = {
                ...chat.lastMessage,
                dateRead: new Date().toISOString(),
              };
            }
          }
        });

        this.allChats = [...this.allChats];
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
    this.getUserForChat();
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
            // Do NOT auto-connect to the message hub silently here.
            // Silent auto-connections caused messages to be marked as read
            // on the server in some deployments. Only connect when the
            // user explicitly opens a chat (handled by ChatArea).
            this.commonService
              .getChatRecipientId()
              .pipe(take(1))
              .subscribe((recipient) => {
                if (recipient) {
                  this.selectChat([recipient]);
                }
              });
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

  ngOnDestroy(): void {
    this.commonService.setChatSelectOption(false);
    this.commonService.setChatRecipientId(null);

    try {
      this.signalRService.disconnectFromMessageHub();
    } catch (e) {
      console.warn('Error disconnecting from message hub on goBack', e);
    }
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
    const currentUserId = this.userService.getUser()?.data?.id;

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

  private getUserForChat() {
    this.commonService.getChatRecipientId().subscribe((user) => {
      if (user !== null) {
        this.selectChat([user]);
      }
    });
  }

  onBackToList(): void {
    this.isChatSelected = false;
    this.commonService.setChatSelectOption(false);

    try {
      this.signalRService.disconnectFromMessageHub();
    } catch (e) {
      console.warn('Error disconnecting from message hub on goBack', e);
    }
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

      const currentUserId = this.userService.getUser()?.data?.id;
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
    const normalize = (v: any) =>
      v === null || v === undefined ? '' : String(v);
    const currentUserId = normalize(this.userService.getUser()?.data?.id);

    const partnerIdFromUpdate =
      chatUpdate.chatPartnerId ??
      chatUpdate.ChatPartnerId ??
      chatUpdate.ChatPartnerId ??
      null;
    const lastMessageFromUpdate =
      chatUpdate.lastMessage ?? chatUpdate.LastMessage ?? null;
    const lastActivityFromUpdate =
      chatUpdate.lastActivity ?? chatUpdate.LastActivity ?? null;
    const unreadFromUpdate =
      chatUpdate.unreadCount ?? chatUpdate.UnreadCount ?? null;
    const chatIdFromUpdate = normalize(
      chatUpdate.chatId ??
        chatUpdate.ChatId ??
        chatUpdate.threadId ??
        chatUpdate.ThreadId ??
        ''
    );

    const chatIndex = this.allChats.findIndex((chat: any) => {
      const parts = chat.participants || [];
      const partner =
        parts.find((p: any) => normalize(p?.id) !== currentUserId) || parts[0];
      const partnerId = normalize(partner?.id);
      const chatId = normalize(
        chat?.id ?? chat?.chatId ?? chat?.threadId ?? ''
      );

      const lastMessageIdMatches =
        normalize(chat.lastMessage?.id) ===
        normalize(lastMessageFromUpdate?.id);

      return (
        (partnerId && partnerId === normalize(partnerIdFromUpdate)) ||
        (chatIdFromUpdate && chatId && chatId === chatIdFromUpdate) ||
        lastMessageIdMatches
      );
    });

    if (chatIndex !== -1) {
      const normalizedLastMessage = lastMessageFromUpdate
        ? {
            id: lastMessageFromUpdate?.id ?? null,
            senderId:
              lastMessageFromUpdate?.senderId ??
              lastMessageFromUpdate?.fromId ??
              null,
            senderName:
              lastMessageFromUpdate?.senderName ??
              lastMessageFromUpdate?.fromName ??
              null,
            content:
              lastMessageFromUpdate?.content ??
              lastMessageFromUpdate?.message ??
              lastMessageFromUpdate?.text ??
              '',
            messageSent:
              lastMessageFromUpdate?.messageSent ??
              lastMessageFromUpdate?.sentAt ??
              lastMessageFromUpdate?.timestamp ??
              null,
            dateRead: lastMessageFromUpdate?.dateRead ?? null,
          }
        : null;

      if (normalizedLastMessage) {
        this.allChats[chatIndex].lastMessage = normalizedLastMessage;
      }

      if (lastActivityFromUpdate) {
        this.allChats[chatIndex].lastActivity = lastActivityFromUpdate;
      }

      if (unreadFromUpdate !== null && unreadFromUpdate !== undefined) {
        this.allChats[chatIndex].unreadCount = unreadFromUpdate;
      }

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
