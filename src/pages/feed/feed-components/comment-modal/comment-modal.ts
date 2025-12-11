import { Component, Input, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Overlay } from '../../../../shared/overlay/overlay';
import {
  ReactiveFormsModule,
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

  public env: any = env;
  public comments: any[] = [];
  public isLoadingComments = false;

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
        this.comments = response.data;
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
        this.loadComments();
      },
      error: (err: any) => {
        console.log('Error adding comment:', err);
        this.toastService.error('Failed to add comment');
      },
    });
  }

  likeComment(commentId: string, index: number) {
    this.apiService.likeComment(commentId).subscribe({
      next: (response: any) => {
        this.loadComments();
      },
      error: (err: any) => {
        console.log('Error liking comment:', err);
        this.toastService.error('Failed to like comment.');
      },
    });
  }

  deleteComment(commentId: string, index: number) {
    this.apiService.deleteComment(commentId).subscribe({
      next: (response: any) => {
        this.toastService.success('Comment deleted successfully.');
        this.comments.splice(index, 1);
      },
      error: (err: any) => {
        console.log('Error deleting comment:', err);
        this.toastService.error('Failed to delete comment.');
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
