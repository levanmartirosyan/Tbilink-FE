import { Component, Input } from '@angular/core';
import { RelativeTimePipe } from '../../../../core/pipes/relative-time-pipe-pipe';
import { UserService } from '../../../../core/services/user-service';
import { SignalRService } from '../../../../core/services/signal-r-service';
import { CommonModule } from '@angular/common';
import { env } from '../../../../enviroment/enviroment';

@Component({
  selector: 'app-chat',
  imports: [RelativeTimePipe, CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat {
  constructor(
    public userService: UserService,
    public signalRService: SignalRService
  ) {}

  @Input() chatData: any;

  public env = env;

  getUnreadCount(): number {
    // First check if there's a stored unread count in the signal
    if (!this.chatData?.participants?.[0]) return 0;
    const partnerId = this.chatData.participants[0].id;
    const signalCount = this.signalRService.chatUnreadCounts()?.[partnerId];

    // If signal has a count, use it; otherwise fall back to chatData.unreadCount
    if (signalCount !== undefined && signalCount !== null) {
      return signalCount;
    }

    return this.chatData.unreadCount ?? 0;
  }
}
