import { Component, Input } from '@angular/core';
import { RelativeTimePipe } from '../../../../core/pipes/relative-time-pipe-pipe';
import { UserService } from '../../../../core/services/user-service';
import { SignalRService } from '../../../../core/services/signal-r-service';

@Component({
  selector: 'app-chat',
  imports: [RelativeTimePipe],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat {
  constructor(
    public userService: UserService,
    public signalRService: SignalRService
  ) {}

  @Input() chatData: any;
}
