import { Component, OnDestroy, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Chat } from './messenger-components/chat/chat';
import { ChatArea } from './messenger-components/chat-area/chat-area';
import { SignalRService } from '../../core/services/signal-r-service';
import { ApiService } from '../../core/services/api-service';
import { CommonService } from '../../core/services/common-service';
import { ChatParticipantDto } from '../../core/interfaces/message-interface';

@Component({
  selector: 'app-messenger',
  imports: [LucideAngularModule, Chat, ChatArea],
  templateUrl: './messenger.html',
  styleUrl: './messenger.scss',
})
export class Messenger implements OnInit, OnDestroy {
  constructor(
    public signalRService: SignalRService,
    private apiService: ApiService,
    private commonService: CommonService
  ) {}

  onlineUserIds: any[] = [];
  ngOnInit() {
    setTimeout(() => {
      this.onlineUserIds = this.signalRService.onlineUsers();
      console.log('Currently online users:', this.onlineUserIds);
    }, 3000);

    this.getAllChats();
  }

  ngOnDestroy(): void {
    this.commonService.setChatSelectOption(false);
  }

  isUserOnline(userId: string): boolean {
    return this.signalRService.isUserOnline(userId);
  }

  public allChats: any[] = [];
  getAllChats() {
    this.apiService.getAllChats().subscribe({
      next: (data: any) => {
        this.allChats = data.data;
        console.log('All chats:', this.allChats);
      },
      error: (error: any) => {
        console.log('Error fetching chats:', error);
      },
    });
  }

  public selectedChatParticipants: ChatParticipantDto[] = [];

  selectChat(chat: ChatParticipantDto[]) {
    console.log(chat);

    const currentUserId = this.signalRService.currentThread;

    if (!chat || !Array.isArray(chat)) {
      this.selectedChatParticipants = [];
      return;
    }

    this.selectedChatParticipants = chat.filter(
      (participant: any) => participant.id !== currentUserId
    );

    this.commonService.setChatSelectOption(true);
    console.log(this.selectedChatParticipants);
  }
}
