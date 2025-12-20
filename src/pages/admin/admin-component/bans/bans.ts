import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';
import { ApiService } from '../../../../core/services/api-service';
import { ToastService } from '../../../../core/services/toast-service';
import { Pagination } from '../pagination/pagination';
import { LucideAngularModule } from 'lucide-angular';
import { env } from '../../../../enviroment/enviroment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bans',
  imports: [Pagination, LucideAngularModule, CommonModule, SpinnerLoader],
  templateUrl: './bans.html',
  styleUrl: './bans.scss',
})
export class Bans implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public bans: any[] = [];
  public pageNumber: number = 1;
  public pageSize: number = 10;
  public totalCount: number = 0;
  public totalPages: number = 1;
  public hasPreviousPage: boolean = false;
  public hasNextPage: boolean = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadBans();
  }

  public isLoading: boolean = false;

  public env = env;

  loadBans(
    pageNumber: number = this.pageNumber,
    pageSize: number = this.pageSize
  ) {
    this.isLoading = true;
    this.api
      .getAllBans(pageNumber, pageSize)
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

          this.bans = Array.isArray(items) ? items : [];

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
          this.bans = [];
        },
      });
  }

  gotoPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadBans(page, this.pageSize);
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
