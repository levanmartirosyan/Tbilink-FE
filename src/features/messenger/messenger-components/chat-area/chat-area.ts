import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
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
import { HubConnectionState } from '@microsoft/signalr';
import { DotLoader } from '../../../../shared/loadings/dot-loader/dot-loader';

@Component({
  selector: 'app-chat-area',
  imports: [
    LucideAngularModule,
    RelativeTimePipe,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    DotLoader,
  ],
  templateUrl: './chat-area.html',
  styleUrl: './chat-area.scss',
})
export class ChatArea implements OnInit, OnDestroy, OnChanges {
  chatMessages;
  messageInput = new FormControl('');
  @Input() otherUserId: ChatParticipantDto[] = [];

  editingMessageId: number | null = null;
  editContent: string = '';
  private lastMessageCount = 0;
  private shouldScroll = true;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // Expose typingUsers signal directly for template reactivity
  typingUsers;

  constructor(
    public signalRService: SignalRService,
    public userService: UserService,
    public commonService: CommonService
  ) {
    this.chatMessages = this.signalRService.messages;
    this.typingUsers = this.signalRService.typingUsers;

    // Auto-scroll when new messages arrive (if user is at bottom)
    effect(() => {
      const messages = this.chatMessages();
      if (messages && messages.length > 0) {
        // Only scroll if new messages were added and user is at bottom
        if (messages.length > this.lastMessageCount) {
          this.lastMessageCount = messages.length;
          if (this.shouldScroll) {
            setTimeout(() => this.scrollToBottom(true), 50);
          }
        }
      }
    });

    // Auto-scroll when typing indicator appears (if user is at bottom)
    effect(() => {
      const typing = this.typingUsers();
      const other = this.otherUserId?.[0];
      if (other?.id && typing?.[String(other.id)] && this.shouldScroll) {
        setTimeout(() => this.scrollToBottom(true), 50);
      }
    });
  }

  /**
   * Get the user's last active date (or null if online)
   */
  getLastActiveDate(): Date | null {
    const other = this.otherUserId?.[0];
    if (!other?.id) return null;

    const userId = other.id.toString();

    if (this.signalRService.isUserOnline(userId)) {
      return null; // User is online
    }

    return this.signalRService.getUserLastActive(userId);
  }

  /**
   * Check if user is online
   */
  isOtherUserOnline(): boolean {
    const other = this.otherUserId?.[0];
    if (!other?.id) return false;
    return this.signalRService.isUserOnline(other.id.toString());
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['otherUserId'] && this.otherUserId?.length > 0) {
      const otherUser = this.otherUserId[0];
      const currentUser = this.userService.getUser();
      console.log(`Connecting to chat with user:`, otherUser);

      if (otherUser?.id && currentUser) {
        this.signalRService.disconnectFromMessageHub();
        // Always use connectToMessageHub - it will mark messages as read
        this.signalRService.connectToMessageHub(currentUser, otherUser.id);

        // Reset message count and scroll to top on new chat
        this.lastMessageCount = 0;
        this.shouldScroll = true;
        setTimeout(() => this.scrollToBottom(), 100);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
    // optional: notify stop for safety
    const other = this.otherUserId?.[0];
    if (other?.id) this.signalRService.stopTyping(other.id);

    this.signalRService.disconnectFromMessageHub();
  }

  private scrollToBottom(force: boolean = false): void {
    try {
      const el = this.messagesContainer.nativeElement;
      if (this.shouldScroll || force) {
        el.scrollTop = el.scrollHeight;
      }
    } catch (err) {}
  }

  // Check if user is near bottom - update shouldScroll flag
  onScroll(): void {
    const el = this.messagesContainer.nativeElement;
    // If user is within 100px of bottom, auto-scroll is enabled
    this.shouldScroll = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }

  sendMessage(): void {
    const content = this.messageInput.value?.trim();
    if (!content) return;

    const otherUser = this.otherUserId[0];
    if (!otherUser?.id) return;

    clearTimeout(this.typingTimeout);
    this.signalRService.stopTyping(otherUser.id);

    // Enable scrolling when user sends a message
    this.shouldScroll = true;

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

  typingTimeout: any;

  onTyping(): void {
    const other = this.otherUserId?.[0];
    if (!other?.id) return;

    const content = this.messageInput.value ?? '';

    if (content.trim().length === 0) {
      clearTimeout(this.typingTimeout);
      this.signalRService.stopTyping(other.id);
      return;
    }

    if (
      !this.signalRService.messageHubConnection ||
      this.signalRService.messageHubConnection.state !==
        HubConnectionState.Connected
    ) {
      return;
    }

    this.signalRService.startTyping(other.id);

    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.signalRService.stopTyping(other.id);
    }, 1200);
  }

  onInputBlur(): void {
    const other = this.otherUserId?.[0];
    if (!other?.id) return;
    clearTimeout(this.typingTimeout);
    this.signalRService.stopTyping(other.id);
  }

  // Check if the other user is typing - reads from signal for reactivity
  isOtherUserTyping(): boolean {
    const other = this.otherUserId?.[0];
    if (!other?.id) return false;
    const typing = this.typingUsers();
    return !!typing?.[String(other.id)];
  }

  // Check if this is the first message of a minute group
  isFirstMessageOfMinute(message: any, index: number): boolean {
    const messages = this.chatMessages();
    if (index === 0) return true; // First message always shows timestamp

    const currentMessageTime = new Date(message.messageSent);
    const currentMinute =
      currentMessageTime.getHours() * 60 + currentMessageTime.getMinutes();

    const prevMessage = messages[index - 1];
    const prevMessageTime = new Date(prevMessage.messageSent);
    const prevMinute =
      prevMessageTime.getHours() * 60 + prevMessageTime.getMinutes();

    return currentMinute !== prevMinute;
  }

  // Check if this is the very last sent message in the conversation
  isLastSentMessage(message: any, index: number): boolean {
    const messages = this.chatMessages();
    const currentUserId = +(this.userService.getUser()?.data?.id || 0);

    // Only check for sent messages
    if (message?.senderId !== currentUserId) {
      return false;
    }

    // Find the last message we sent in the entire conversation
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId === currentUserId) {
        return messages[i].id === message.id;
      }
    }

    return false;
  }

  // Get read status text
  getReadStatus(message: any): string {
    // If dateRead is null/undefined, message is delivered but not read
    if (message?.dateRead) {
      return 'Seen';
    }
    return 'Delivered';
  }
}
