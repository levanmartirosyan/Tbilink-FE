import { Component, effect, Input } from '@angular/core';
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
  private _chatData: any;

  constructor(
    public userService: UserService,
    public signalRService: SignalRService
  ) {
    // react to changes in the global unread counts signal, update asynchronously
    effect(() => {
      const partnerId = this._chatData?.participants?.[0]?.id;
      const counts = this.signalRService.chatUnreadCounts();
      const newVal = partnerId
        ? counts[partnerId] ?? this._chatData?.unreadCount ?? 0
        : 0;
      if (newVal !== this.unreadCount) {
        setTimeout(() => (this.unreadCount = newVal), 0);
      }
    });
  }

  @Input()
  set chatData(value: any) {
    this._chatData = value;
    // initialize cached value when input changes
    this.unreadCount = this.getUnreadCount();
  }
  get chatData(): any {
    return this._chatData;
  }

  public env = env;
  public unreadCount: number = 0;

  getUnreadCount(): number {
    if (!this._chatData?.participants?.[0]) return 0;
    const partnerId = this._chatData.participants[0].id;
    const signalCount = this.signalRService.chatUnreadCounts()?.[partnerId];

    if (signalCount !== undefined && signalCount !== null) {
      return signalCount;
    }

    return this._chatData.unreadCount ?? 0;
  }
}
