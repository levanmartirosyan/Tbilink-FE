import {
  Component,
  Input,
  Output,
  EventEmitter,
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
import { EmojiPickerComponent } from '../../../../shared/emoji-picker/emoji-picker';
import { ApiService } from '../../../../core/services/api-service';
import { ToastService } from '../../../../core/services/toast-service';
import { env } from '../../../../enviroment/enviroment';

@Component({
  selector: 'app-chat-area',
  imports: [
    LucideAngularModule,
    RelativeTimePipe,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    DotLoader,
    EmojiPickerComponent,
  ],
  templateUrl: './chat-area.html',
  styleUrl: './chat-area.scss',
})
export class ChatArea implements OnInit, OnDestroy, OnChanges {
  chatMessages;
  messageInput = new FormControl('');
  @Input() otherUserId: ChatParticipantDto[] = [];
  @Output() backToList = new EventEmitter<void>();

  editingMessageId: number | null = null;
  editContent: string = '';
  private lastMessageCount = 0;
  private shouldScroll = true;

  showEmojiPicker = false;

  public env = env;

  isUploading = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  typingUsers;

  constructor(
    public signalRService: SignalRService,
    public userService: UserService,
    public commonService: CommonService,
    private apiService: ApiService,
    private toastService: ToastService
  ) {
    this.chatMessages = this.signalRService.messages;
    this.typingUsers = this.signalRService.typingUsers;

    effect(() => {
      const messages = this.chatMessages();
      if (messages && messages.length > 0) {
        if (messages.length > this.lastMessageCount) {
          this.lastMessageCount = messages.length;
          if (this.shouldScroll) {
            setTimeout(() => this.scrollToBottom(true), 50);
          }
        }
      }
    });

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

  /**
   * Go back to chat list (mobile)
   */
  goBack(): void {
    this.backToList.emit();
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

        this.lastMessageCount = 0;
        this.shouldScroll = true;
        setTimeout(() => this.scrollToBottom(), 100);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.typingTimeout) clearTimeout(this.typingTimeout);
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

  onScroll(): void {
    const el = this.messagesContainer.nativeElement;
    // If user is within 100px of bottom, auto-scroll is enabled
    this.shouldScroll = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }

  sendMessage(): void {
    const content = this.messageInput.value?.trim();
    if (!content) return;

    this.sendMessageToUser(content);
    this.messageInput.reset();
  }

  onEmojiSelect(emoji: string): void {
    const currentValue = this.messageInput.value || '';
    this.messageInput.setValue(currentValue + emoji);
    this.showEmojiPicker = false;
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  closeEmojiPicker(): void {
    this.showEmojiPicker = false;
  }

  onAttachmentClick(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    const file = files[0];
    this.uploadAttachment(file);

    input.value = '';
  }

  private uploadAttachment(file: File): void {
    const otherUser = this.otherUserId[0];
    if (!otherUser?.id) return;

    this.isUploading = true;

    const formData = new FormData();
    formData.append('file', file);

    const folder = `messages/${this.userService.getUser()?.data?.id}`;

    this.apiService.uploadPublicFile(formData, folder).subscribe({
      next: (response: any) => {
        const filePath =
          response?.data?.path || response?.path || response?.fileName;
        const fileType = this.getFileType(file.type);

        try {
          this.isUploading = false;
          const base = (this.env?.storageUrl || '').replace(/\/+$/g, '');
          const path = (filePath || '').replace(/^\/+/, '');
          const publicUrl = base ? `${base}/${path}` : filePath;

          const message = `[${fileType.toUpperCase()}]${publicUrl}`;
          this.sendMessageToUser(message);
        } catch (error) {
          this.isUploading = false;
          console.error('Error building attachment URL:', error);
          const message = `[${fileType.toUpperCase()}]${filePath}`;
          this.sendMessageToUser(message);
        }
      },
      error: (error) => {
        this.isUploading = false;
        this.toastService.error('Failed to upload file');
        console.error('Upload error:', error);
      },
    });
  }

  private getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'file';
  }

  private sendMessageToUser(content: string): void {
    if (!content.trim()) return;

    const otherUser = this.otherUserId[0];
    if (!otherUser?.id) return;

    clearTimeout(this.typingTimeout);
    this.signalRService.stopTyping(otherUser.id);

    // Enable scrolling when user sends a message
    this.shouldScroll = true;

    this.signalRService.sendMessage(otherUser.id, content);

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

  // Extract attachment URL from message content
  getAttachmentUrl(content: string): string {
    const index = content.indexOf(']');
    if (index !== -1) {
      return content.substring(index + 1);
    }
    return content;
  }

  // Check if message is an image attachment
  isImageAttachment(content: string): boolean {
    return content.startsWith('[IMAGE]');
  }

  // Check if message is a video attachment
  isVideoAttachment(content: string): boolean {
    return content.startsWith('[VIDEO]');
  }

  // Check if message is a file attachment
  isFileAttachment(content: string): boolean {
    return content.startsWith('[FILE]');
  }

  // Check if message is any type of attachment
  isAttachment(content: string): boolean {
    return (
      this.isImageAttachment(content) ||
      this.isVideoAttachment(content) ||
      this.isFileAttachment(content)
    );
  }

  // Download file from signed URL
  downloadAttachment(url: string, fileName: string = 'file'): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
