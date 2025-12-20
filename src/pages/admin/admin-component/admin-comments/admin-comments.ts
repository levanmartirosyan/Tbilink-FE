import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { Pagination } from '../pagination/pagination';
import { ApiService } from '../../../../core/services/api-service';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';
import { env } from '../../../../enviroment/enviroment';
import { ModalComponent } from '../../../../shared/modal/modal';
import { ToastService } from '../../../../core/services/toast-service';

@Component({
  selector: 'app-admin-comments',
  imports: [
    LucideAngularModule,
    CommonModule,
    Pagination,
    SpinnerLoader,
    ModalComponent,
  ],
  templateUrl: './admin-comments.html',
  styleUrl: './admin-comments.scss',
})
export class AdminComments implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public comments: any[] = [];
  public pageNumber: number = 1;
  public pageSize: number = 10;
  public totalCount: number = 0;
  public totalPages: number = 1;
  public hasPreviousPage: boolean = false;
  public hasNextPage: boolean = false;

  public isLoading: boolean = false;
  public env = env;

  public commentModal: boolean = false;
  public selectedCommentPost: any = null;

  public deleteCommentModal: boolean = false;
  public deletingComment: any = null;
  public isDeletingComment: boolean = false;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(
    pageNumber: number = this.pageNumber,
    pageSize: number = this.pageSize
  ) {
    this.isLoading = true;
    this.api
      .getAllComments(pageNumber, pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          const payload = res?.data ?? res;

          let items: any[] = [];
          if (Array.isArray(payload)) items = payload;
          else if (Array.isArray(payload?.data)) items = payload.data;
          else if (Array.isArray(payload?.items)) items = payload.items;
          else if (Array.isArray(payload?.data?.data))
            items = payload.data.data;
          else {
            const vals = Object.values(payload || {});
            if (vals.length && vals.every((v) => typeof v === 'object'))
              items = vals as any[];
          }

          this.comments = Array.isArray(items) ? items : [];

          this.pageNumber = payload?.pageNumber ?? pageNumber;
          this.pageSize = payload?.pageSize ?? pageSize;
          this.totalCount =
            payload?.totalCount ?? payload?.data?.totalCount ?? 0;
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
          console.error('Failed to load admin comments', err);
          this.comments = [];
        },
      });
  }

  gotoPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadComments(page, this.pageSize);
  }

  getPageItems(): Array<number | string> {
    const total = this.totalPages || 1;
    const current = this.pageNumber || 1;
    const delta = 2;

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const range: Array<number | string> = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < total - 1) range.push('...');
    range.push(total);
    return range;
  }

  closeCommentModal = () => {
    this.commentModal = false;
    this.selectedCommentPost = null;
  };

  openDeleteCommentModal(comment: any) {
    this.deletingComment = comment;
    this.deleteCommentModal = true;
  }

  closeDeleteCommentModal = () => {
    this.deleteCommentModal = false;
    this.deletingComment = null;
    this.isDeletingComment = false;
  };

  confirmDeleteComment() {
    if (!this.deletingComment?.id) return;
    this.isDeletingComment = true;
    this.api
      .deleteComment(this.deletingComment.id.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isDeletingComment = false;
          this.toast.success('Comment deleted');
          this.comments = this.comments.filter(
            (c) => c.id !== this.deletingComment.id
          );
          this.closeDeleteCommentModal();
        },
        error: (err: any) => {
          this.isDeletingComment = false;
          this.toast.error(err.error?.message || 'Failed to delete comment');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
