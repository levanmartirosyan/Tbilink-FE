import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  effect,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { RelativeTimePipe } from '../../../../core/pipes/relative-time-pipe-pipe';
import { UserService } from '../../../../core/services/user-service';
import { SignalRService } from '../../../../core/services/signal-r-service';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonService } from '../../../../core/services/common-service';
import { CommonModule } from '@angular/common';
import { ChatParticipantDto } from '../../../../core/interfaces/message-interface';

@Component({
  selector: 'app-chat-area',
  imports: [
    LucideAngularModule,
    RelativeTimePipe,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './chat-area.html',
  styleUrl: './chat-area.scss',
})
export class ChatArea
  implements OnInit, OnDestroy, OnChanges, AfterViewChecked
{
  chatMessages;
  messageInput = new FormControl('');
  @Input() otherUserId: ChatParticipantDto[] = [];

  editingMessageId: number | null = null;
  editContent: string = '';

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  constructor(
    public signalRService: SignalRService,
    public userService: UserService,
    public commonService: CommonService
  ) {
    this.chatMessages = this.signalRService.messages;

    effect(() => {
      const messages = this.chatMessages();
      if (messages && messages.length > 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['otherUserId'] && this.otherUserId?.length > 0) {
      const otherUser = this.otherUserId[0];
      const currentUser = this.userService.getUser();
      console.log(`Connecting to chat with user:`, otherUser);

      if (otherUser?.id && currentUser) {
        this.signalRService.disconnectFromMessageHub();

        this.signalRService.connectToMessageHub(currentUser, otherUser.id);
      }
    }
  }

  ngOnDestroy(): void {
    this.signalRService.disconnectFromMessageHub();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (err) {}
  }

  sendMessage(): void {
    const content = this.messageInput.value?.trim();
    if (!content) return;

    const otherUser = this.otherUserId[0];
    if (!otherUser?.id) return;

    this.signalRService.sendMessage(otherUser.id, content);
    this.messageInput.reset();

    setTimeout(() => this.scrollToBottom(), 50);
  }

  isSent(message: any): boolean {
    const currentUserId = this.userService.getUser()?.data?.id;
    return message?.senderId === currentUserId;
  }

  senderLabel(message: any): string {
    const currentUserId = this.userService.getUser()?.data?.id;

    if (message?.senderId === currentUserId) {
      return 'You: ';
    }

    const otherUser = this.otherUserId[0];
    if (otherUser) {
      return `${otherUser.firstName}: `;
    }

    return message?.senderName ? `${message.senderName}: ` : '';
  }

  startEdit(message: any): void {
    this.editingMessageId = message.id;
    this.editContent = message.content;
  }

  saveEdit(messageId: number): void {
    if (!this.editContent.trim()) return;
    this.signalRService.editMessage(messageId, this.editContent);
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.editContent = '';
  }
}
