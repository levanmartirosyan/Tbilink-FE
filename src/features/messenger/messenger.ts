import { Component, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Chat } from './messenger-components/chat/chat';
import { ChatArea } from './messenger-components/chat-area/chat-area';
import { SignalRService } from '../../core/services/signal-r-service';

@Component({
  selector: 'app-messenger',
  imports: [LucideAngularModule, Chat, ChatArea],
  templateUrl: './messenger.html',
  styleUrl: './messenger.scss',
})
export class Messenger implements OnInit {
  constructor(public signalRService: SignalRService) {}

  onlineUserIds: any[] = [];
  ngOnInit() {
    setTimeout(() => {
      this.onlineUserIds = this.signalRService.onlineUsers(); // Get current value
      console.log('Currently online users:', this.onlineUserIds);
    }, 3000);
  }

  isUserOnline(userId: string): boolean {
    return this.signalRService.isUserOnline(userId);
  }
}
