import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { Pagination } from '../pagination/pagination';
import { ApiService } from '../../../../core/services/api-service';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';
import { env } from '../../../../enviroment/enviroment';
import { CommentModal } from '../../../feed/feed-components/comment-modal/comment-modal';
import { ModalComponent } from '../../../../shared/modal/modal';
import { ToastService } from '../../../../core/services/toast-service';

@Component({
  selector: 'app-admin-posts',
  imports: [
    LucideAngularModule,
    CommonModule,
    Pagination,
    SpinnerLoader,
    CommentModal,
    ModalComponent,
  ],
  templateUrl: './admin-posts.html',
  styleUrl: './admin-posts.scss',
})
export class AdminPosts implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public posts: any[] = [];
  public pageNumber: number = 1;
  public pageSize: number = 10;
  public totalCount: number = 0;
  public totalPages: number = 1;
  public hasPreviousPage: boolean = false;
  public hasNextPage: boolean = false;

  constructor(private api: ApiService, private toast: ToastService) {}

  public commentModal: boolean = false;
  public selectedCommentPost: any = null;

  public deletePostModal: boolean = false;
  public deletingPost: any = null;
  public isDeletingPost: boolean = false;

  ngOnInit(): void {
    this.loadPosts();
  }

  public isLoading: boolean = false;

  public env = env;

  loadPosts(
    pageNumber: number = this.pageNumber,
    pageSize: number = this.pageSize
  ) {
    this.isLoading = true;
    this.api
      .getAllPostsPaginated(pageNumber, pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;

          const payload = res?.data ?? res;

          let items: any[] = [];
          if (Array.isArray(payload)) items = payload;
          else if (Array.isArray(payload?.data)) items = payload.data;
          else if (Array.isArray(payload?.items)) items = payload.items;
          else {
            const vals = Object.values(payload || {});
            if (vals.length && vals.every((v) => typeof v === 'object'))
              items = vals as any[];
          }

          this.posts = Array.isArray(items) ? items : [];

          this.pageNumber = payload?.pageNumber ?? pageNumber;
          this.pageSize = payload?.pageSize ?? pageSize;
          this.totalCount = payload?.totalCount ?? 0;
          this.totalPages =
            payload?.totalPages ??
            Math.max(1, Math.ceil(this.totalCount / this.pageSize));
          this.hasPreviousPage =
            payload?.hasPreviousPage ?? this.pageNumber > 1;
          this.hasNextPage =
            payload?.hasNextPage ?? this.pageNumber < this.totalPages;
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Failed to load admin users', err);
          this.posts = [];
        },
      });
  }

  gotoPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadPosts(page, this.pageSize);
  }

  getPageItems(): Array<number | string> {
    const total = this.totalPages || 1;
    const current = this.pageNumber || 1;
    const delta = 2;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const range: Array<number | string> = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    range.push(1);
    if (left > 2) {
      range.push('...');
    }

    for (let i = left; i <= right; i++) range.push(i);

    if (right < total - 1) range.push('...');
    range.push(total);

    return range;
  }

  openCommentModal(post: any) {
    this.selectedCommentPost = post;
    this.commentModal = true;
  }

  closeCommentModal = () => {
    this.commentModal = false;
    this.selectedCommentPost = null;
  };

  openDeletePostModal(post: any) {
    this.deletingPost = post;
    this.deletePostModal = true;
  }

  closeDeletePostModal = () => {
    this.deletePostModal = false;
    this.deletingPost = null;
    this.isDeletingPost = false;
  };

  confirmDeletePost() {
    if (!this.deletingPost?.id) return;
    this.isDeletingPost = true;
    this.api
      .deletePost(this.deletingPost.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isDeletingPost = false;
          this.toast.success('Post deleted');
          // remove locally
          this.posts = this.posts.filter((p) => p.id !== this.deletingPost.id);
          this.closeDeletePostModal();
        },
        error: (err: any) => {
          this.isDeletingPost = false;
          this.toast.error(err.error?.message || 'Failed to delete post');
        },
      });
  }

  commentAdded(event: any) {
    const idx = this.posts.findIndex((p) => p.id === event.postId);
    if (idx !== -1) {
      this.posts[idx].commentCount = event.commentCount;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
