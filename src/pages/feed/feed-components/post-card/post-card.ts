import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { FormatNumberPipe } from '../../../../core/pipes/format-number-pipe';
import { CommonModule } from '@angular/common';
import { RelativeTimePipe } from '../../../../core/pipes/relative-time-pipe-pipe';
import { SignalRService } from '../../../../core/services/signal-r-service';
import { ApiService } from '../../../../core/services/api-service';
import { ToastService } from '../../../../core/services/toast-service';
import { UserService } from '../../../../core/services/user-service';
import { env } from '../../../../enviroment/enviroment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-card',
  imports: [
    LucideAngularModule,
    FormatNumberPipe,
    CommonModule,
    RelativeTimePipe,
  ],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {
  constructor(
    public signalRService: SignalRService,
    private apiService: ApiService,
    private toastService: ToastService,
    public userService: UserService,
    private router: Router
  ) {}

  @Input() postData: any;

  @Output() deletePostNewData = new EventEmitter<void>();
  @Output() openEditPostModal = new EventEmitter<any>();
  @Output() openCommentModal = new EventEmitter<any>();

  @ViewChild('settingsWrapper', { read: ElementRef })
  settingsWrapper!: ElementRef;

  public env: any = env;

  public isLiking: boolean = false;

  get userHasLiked(): boolean {
    return this.postData?.isLikedByCurrentUser || false;
  }

  public postSettingsMenu: boolean = false;
  togglepostSettingsMenu() {
    this.postSettingsMenu = !this.postSettingsMenu;
  }

  public editPostModal: boolean = false;
  toggleEditPostModal() {
    this.editPostModal = !this.editPostModal;
    // emit the post data so parent components receive the item to edit
    this.openEditPostModal.emit(this.postData);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.postSettingsMenu) return;

    const target = event.target as Node | null;
    if (!target) {
      this.postSettingsMenu = false;
      return;
    }

    if (!this.settingsWrapper.nativeElement.contains(target)) {
      this.postSettingsMenu = false;
    }
  }

  deletePost() {
    if (!this.postData?.id) return;

    this.apiService.deletePost(this.postData.id).subscribe({
      next: (data: any) => {
        console.log(data);
        this.postSettingsMenu = false;
        this.toastService.success('Post deleted successfully.');
        this.deletePostNewData.emit(this.postData.id);
      },
      error: (err: any) => {
        console.log(err);
        this.toastService.error(err.error.message || 'Failed to delete post.');
      },
    });
  }

  getAllPosts() {
    this.apiService.getAllPosts().subscribe({
      next: (data: any) => {
        console.log(data);
        this.deletePostNewData.emit(data.data);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  goToUserProfile() {
    console.log(this.postData.username);

    if (
      !this.postData?.username ||
      !this.postData?.username == null ||
      this.postData?.username == undefined
    )
      return;

    this.router.navigate([`/profile/${this.postData?.username}`]);
  }

  reportPost() {
    this.toastService.info('Report post feature coming soon.');
  }

  openCommentModalFn() {
    this.openCommentModal.emit(this.postData);
  }

  likePost() {
    if (!this.postData?.id) return;
    if (this.isLiking) return;

    this.isLiking = true;

    const prevLiked = !!this.postData.isLikedByCurrentUser;
    const prevCount =
      typeof this.postData.likeCount === 'number' ? this.postData.likeCount : 0;

    this.postData.isLikedByCurrentUser = !prevLiked;
    this.postData.likeCount =
      prevCount + (this.postData.isLikedByCurrentUser ? 1 : -1);

    this.apiService.likePost(this.postData.id).subscribe({
      next: (data: any) => {
        if (data && data.data) {
          this.postData.isLikedByCurrentUser = data.data.isLikedByCurrentUser;
          this.postData.likeCount = data.data.likeCount;
        } else if (data && typeof data.likeCount === 'number') {
          this.postData.likeCount = data.likeCount;
        }
        this.isLiking = false;
      },
      error: (err: any) => {
        console.log(err);
        this.postData.isLikedByCurrentUser = prevLiked;
        this.postData.likeCount = prevCount;
        this.isLiking = false;
        this.toastService.error(err?.error?.message || 'Failed to like post.');
      },
    });
  }
}
