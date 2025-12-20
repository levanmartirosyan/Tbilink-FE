import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { CustomSelectComponent } from '../../../profile/profile-components/profile-settings/components/profile-info/custom-select/custom-select';
import { AdminEditUserModal } from './admin-edit-user-modal/admin-edit-user-modal';
import { ModalComponent } from '../../../../shared/modal/modal';
import { ApiService } from '../../../../core/services/api-service';
import { ToastService } from '../../../../core/services/toast-service';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';
import { Pagination } from '../pagination/pagination';
import { env } from '../../../../enviroment/enviroment';

@Component({
  selector: 'app-admin-users',
  imports: [
    LucideAngularModule,
    CommonModule,
    SpinnerLoader,
    Pagination,
    CustomSelectComponent,
    AdminEditUserModal,
    ModalComponent,
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  public users: any[] = [];
  public pageNumber: number = 1;
  public pageSize: number = 10;
  public totalCount: number = 0;
  public totalPages: number = 1;
  public hasPreviousPage: boolean = false;
  public hasNextPage: boolean = false;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  public isLoading: boolean = false;

  public env = env;

  public filterValue: string = 'All';

  public editUserModal: boolean = false;
  public editingUser: any = null;

  public deleteUserModal: boolean = false;
  public deletingUser: any = null;
  public isDeleting: boolean = false;

  public unbanUserModal: boolean = false;
  public unbanningUser: any = null;
  public isUnbanning: boolean = false;

  public banUserModal: boolean = false;
  public banningUser: any = null;
  public banReason: string = '';
  public banExpiresAt: string = '';
  public isBanning: boolean = false;
  public minBanDate: string = '';
  public selectedQuickExpire: string | null = null;

  private allUsers: any[] = [];

  onFilterSelect(value: string) {
    this.filterValue = value;
    this.filterUsers(value);
  }

  filterUsers(type: string) {
    const source = Array.isArray(this.allUsers) ? this.allUsers : this.users;
    if (type === 'Admins') {
      this.users = source.filter((u) => u.role == 'Admin' || u.role == 'Owner');
    } else if (type === 'Users') {
      this.users = source.filter((u) => u.role == 'User');
    } else {
      this.users = Array.isArray(this.allUsers) ? [...this.allUsers] : [];
    }
  }

  loadUsers(
    pageNumber: number = this.pageNumber,
    pageSize: number = this.pageSize
  ) {
    this.isLoading = true;
    this.api
      .getAllUsersAdmin(pageNumber, pageSize)
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

          this.allUsers = Array.isArray(items) ? items : [];
          if (this.filterValue && this.filterValue !== 'all') {
            this.filterUsers(this.filterValue);
          } else {
            this.users = [...this.allUsers];
          }

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
          this.users = [];
        },
      });
  }

  gotoPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.loadUsers(page, this.pageSize);
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

  openEditModal(user: any) {
    this.editingUser = user;
    this.editUserModal = true;
  }

  closeEditUserModal = () => {
    this.editUserModal = false;
    this.editingUser = null;
  };

  onUserUpdated(event: any) {
    this.loadUsers(this.pageNumber, this.pageSize);
    this.closeEditUserModal();
  }

  openBanModal(user: any) {
    this.banningUser = user;
    this.banReason = '';
    this.banExpiresAt = '';
    this.minBanDate = this.getMinBanDate();
    this.selectedQuickExpire = null;
    this.banUserModal = true;
  }

  closeBanModal = () => {
    this.banUserModal = false;
    this.banningUser = null;
    this.banReason = '';
    this.banExpiresAt = '';
    this.isBanning = false;
  };

  confirmBanUser() {
    if (!this.banningUser) return;

    // Validation: reason and expiresAt are required
    if (!this.banReason || !this.banReason.trim()) {
      this.toast.error('Reason is required');
      return;
    }

    if (!this.banExpiresAt) {
      this.toast.error('Expires at date/time is required');
      return;
    }

    this.isBanning = true;
    const body: any = {
      reason: this.banReason || '',
      expiresAt: this.banExpiresAt
        ? new Date(this.banExpiresAt).toISOString()
        : null,
    };
    this.api
      .banUser(this.banningUser.id.toString(), body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isBanning = false;
          this.toast.success('User banned');
          this.loadUsers(this.pageNumber, this.pageSize);
          this.closeBanModal();
        },
        error: (err: any) => {
          this.isBanning = false;
          this.toast.error(err.error?.message || 'Failed to ban user');
        },
      });
  }

  openUnbanModal(user: any) {
    this.unbanningUser = user;
    this.unbanUserModal = true;
  }

  closeUnbanModal = () => {
    this.unbanUserModal = false;
    this.unbanningUser = null;
    this.isUnbanning = false;
  };

  confirmUnbanUser() {
    if (!this.unbanningUser) return;
    this.isUnbanning = true;
    this.api
      .unbanUser(this.unbanningUser.id.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isUnbanning = false;
          this.toast.success('User unbanned');
          this.loadUsers(this.pageNumber, this.pageSize);
          this.closeUnbanModal();
        },
        error: (err: any) => {
          this.isUnbanning = false;
          this.toast.error(err.error?.message || 'Failed to unban user');
        },
      });
  }

  private pad(n: number) {
    return n < 10 ? '0' + n : '' + n;
  }

  private formatDateForInput(d: Date): string {
    d.setSeconds(0, 0);
    const yyyy = d.getFullYear();
    const mm = this.pad(d.getMonth() + 1);
    const dd = this.pad(d.getDate());
    const hh = this.pad(d.getHours());
    const min = this.pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  public setQuickExpire(type: '1d' | '1w' | '1m' | '1y' | 'perm') {
    const d = new Date();
    d.setSeconds(0, 0);
    switch (type) {
      case '1d':
        d.setDate(d.getDate() + 1);
        break;
      case '1w':
        d.setDate(d.getDate() + 7);
        break;
      case '1m':
        d.setMonth(d.getMonth() + 1);
        break;
      case '1y':
        d.setFullYear(d.getFullYear() + 1);
        break;
      case 'perm':
        d.setFullYear(d.getFullYear() + 100);
        break;
    }
    this.banExpiresAt = this.formatDateForInput(d);
    this.selectedQuickExpire = type;
  }

  public onExpireInputChange(ev: Event) {
    const target = ev.target as HTMLInputElement | null;
    if (target) {
      this.banExpiresAt = target.value;
    }
    this.selectedQuickExpire = null;
  }

  getMinBanDate(): string {
    const d = new Date();
    // round down seconds & ms
    d.setSeconds(0, 0);
    const yyyy = d.getFullYear();
    const mm = this.pad(d.getMonth() + 1);
    const dd = this.pad(d.getDate());
    const hh = this.pad(d.getHours());
    const min = this.pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }

  openDeleteModal(user: any) {
    this.deletingUser = user;
    this.deleteUserModal = true;
  }

  closeDeleteUserModal = () => {
    this.deleteUserModal = false;
    this.deletingUser = null;
  };

  confirmDeleteUser() {
    if (!this.deletingUser) return;
    this.isDeleting = true;
    this.api
      .removeUser(this.deletingUser.id.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isDeleting = false;
          this.toast.success('User deleted');
          this.loadUsers(this.pageNumber, this.pageSize);
          this.closeDeleteUserModal();
        },
        error: (err: any) => {
          this.isDeleting = false;
          this.toast.error(err.error?.message || 'Failed to delete user');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
