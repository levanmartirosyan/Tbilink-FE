import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Overlay } from '../../../../shared/overlay/overlay';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { env } from '../../../../enviroment/enviroment';
import { ApiService } from '../../../../core/services/api-service';
import { ToastService } from '../../../../core/services/toast-service';
import { UserService } from '../../../../core/services/user-service';
import { SignalRService } from '../../../../core/services/signal-r-service';
import { RelativeTimePipe } from '../../../../core/pipes/relative-time-pipe-pipe';
import { Router } from '@angular/router';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';

@Component({
  selector: 'app-comment-modal',
  imports: [
    LucideAngularModule,
    Overlay,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RelativeTimePipe,
    SpinnerLoader,
  ],
  templateUrl: './comment-modal.html',
  styleUrl: './comment-modal.scss',
})
export class CommentModal implements OnInit {
  @Input() postData: any;
  @Input() toggleCommentModal: (() => void) | undefined;
  @Output() commentAdded = new EventEmitter<any>();

  public env: any = env;
  public comments: any[] = [];
  public isLoadingComments = false;
  public likingComments: Record<string, boolean> = {};
  public editingCommentId?: string | null = null;
  public editingContent: string = '';
  public savingEdits: Record<string, boolean> = {};

  public commentForm: FormGroup = new FormGroup({
    content: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    public userService: UserService,
    public signalRService: SignalRService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.postData?.id) {
      this.loadComments();
    }
  }

  loadComments() {
    this.isLoadingComments = true;
    this.apiService.getPostComments(this.postData.id).subscribe({
      next: (response: any) => {
        this.comments = response.data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoadingComments = false;
      },
      error: (err: any) => {
        console.log('Error loading comments:', err);
        this.toastService.error('Failed to load comments.');
        this.isLoadingComments = false;
      },
    });
  }

  addComment() {
    if (!this.commentForm.valid) {
      return;
    }

    const content = this.commentForm.get('content')?.value;
    this.apiService.createComment(this.postData.id, content).subscribe({
      next: (response: any) => {
        this.toastService.success('Comment added successfully.');
        this.commentForm.reset();
        this.comments.unshift(response.data.comment);
        const changeCount = {
          postId: this.postData.id,
          commentCount: response.data.commentCount,
        };
        this.commentAdded.emit(changeCount);
      },
      error: (err: any) => {
        console.log('Error adding comment:', err);
        this.toastService.error('Failed to add comment');
      },
    });
  }

  likeComment(commentId: string, index: number) {
    if (!commentId) return;
    if (this.likingComments[commentId]) return;

    const comment = this.comments[index];
    if (!comment) return;

    this.likingComments[commentId] = true;

    const prevLiked = !!comment.isLikedByCurrentUser;
    const prevCount =
      typeof comment.likeCount === 'number' ? comment.likeCount : 0;

    comment.isLikedByCurrentUser = !prevLiked;
    comment.likeCount = prevCount + (comment.isLikedByCurrentUser ? 1 : -1);

    this.apiService.likeComment(commentId).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          comment.isLikedByCurrentUser = response.data.isLikedByCurrentUser;
          comment.likeCount = response.data.likeCount;
        } else if (response && typeof response.likeCount === 'number') {
          comment.likeCount = response.likeCount;
        }
        this.likingComments[commentId] = false;
      },
      error: (err: any) => {
        console.log('Error liking comment:', err);
        comment.isLikedByCurrentUser = prevLiked;
        comment.likeCount = prevCount;
        this.likingComments[commentId] = false;
        this.toastService.error('Failed to like comment.');
      },
    });
  }

  deleteComment(commentId: string, index: number) {
    this.apiService.deleteComment(commentId).subscribe({
      next: (response: any) => {
        this.toastService.success('Comment deleted successfully.');
        this.comments.splice(index, 1);
        const changeCount = {
          postId: this.postData.id,
          commentCount: this.postData.commentCount - 1,
        };
        this.commentAdded.emit(changeCount);
      },
      error: (err: any) => {
        console.log('Error deleting comment:', err);
        this.toastService.error('Failed to delete comment.');
      },
    });
  }

  startEdit(commentId: string, index: number) {
    const comment = this.comments[index];
    if (!comment) return;
    this.editingCommentId = commentId;
    this.editingContent = comment.content || '';
  }

  cancelEdit() {
    this.editingCommentId = null;
    this.editingContent = '';
  }

  saveEdit(commentId: string, index: number) {
    if (!commentId) return;
    if (this.savingEdits[commentId]) return;

    const comment = this.comments[index];
    if (!comment) return;

    const prevContent = comment.content;
    comment.content = this.editingContent;
    this.savingEdits[commentId] = true;

    this.apiService.updateComment(commentId, this.editingContent).subscribe({
      next: (response: any) => {
        // prefer server-provided content
        if (response && response.data) {
          comment.content =
            response.data.content ||
            response.data.comment?.content ||
            comment.content;
        }
        this.savingEdits[commentId] = false;
        this.cancelEdit();
      },
      error: (err: any) => {
        console.log('Error updating comment:', err);
        // revert
        comment.content = prevContent;
        this.savingEdits[commentId] = false;
        this.toastService.error('Failed to update comment.');
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
}
