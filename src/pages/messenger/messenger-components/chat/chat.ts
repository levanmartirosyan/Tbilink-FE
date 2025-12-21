import { Component, effect, Input } from '@angular/core';
import { RelativeTimePipe } from '../../../../core/pipes/relative-time-pipe-pipe';
import { UserService } from '../../../../core/services/user-service';
import { SignalRService } from '../../../../core/services/signal-r-service';
import { CommonModule, NgIf } from '@angular/common';
import { env } from '../../../../enviroment/enviroment';

@Component({
  selector: 'app-chat',
  imports: [RelativeTimePipe, CommonModule, NgIf],
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

  isVideoUrl(path: string | undefined | null): boolean {
    if (!path) return false;
    const lower = path.toLowerCase();
    return /\.(mp4|webm|ogg)$/i.test(lower);
  }

  isImageUrl(path: string | undefined | null): boolean {
    if (!path) return false;
    const lower = path.toLowerCase();
    return /\.(jpeg|jpg|gif|png|webp|heic|heif)$/i.test(lower);
  }

  isFileUrl(path: string | undefined | null): boolean {
    if (!path) return false;
    const lower = path.toLowerCase();
    return /\.(pdf|docx|doc|xls|xlsx|ppt|pptx|zip|rar|txt)$/i.test(lower);
  }

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
