import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import { CommonService } from '../../core/services/common-service';
import { FullUser } from '../../core/types/user';
import { LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FollowersCounter } from './profile-components/followers-counter/followers-counter';
import { ProfileInfo } from './profile-components/profile-info/profile-info';
import { SegmentedSwitcher } from '../../shared/segmented-switcher/segmented-switcher';
import { ModalComponent } from '../../shared/modal/modal';
import { env } from '../../enviroment/enviroment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../core/services/user-service';
import { ToastService } from '../../core/services/toast-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [
    LucideAngularModule,
    RouterModule,
    FollowersCounter,
    ProfileInfo,
    SegmentedSwitcher,
    ModalComponent,
    CommonModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit, OnDestroy {
  constructor(
    private api: ApiService,
    private commonService: CommonService,
    private router: Router,
    private actR: ActivatedRoute,
    private userService: UserService,
    private toastService: ToastService
  ) {
    this.currentUserId = this.userService.getUser()?.data.id;
  }

  public currentUserId?: string;
  public userData?: FullUser;
  public profileRoute: any = '';
  public username: any;
  public env: any = env;
  private destroy$ = new Subject<void>();

  // Modal properties
  public isUploadCoverModalOpen: boolean = false;
  public selectedFile: File | null = null;
  public isUploading: boolean = false;
  public previewUrl: string | null = null;
  @ViewChild('fileInput') fileInput!: ElementRef;

  ngOnInit(): void {
    this.actR.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      console.log(params);
      this.getUserData(params['username']);
      const urlSegments = this.router.url.split('/').filter((s) => s);
      this.profileRoute = ['', ...urlSegments.slice(0, 2)];
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserData(username: string) {
    this.api
      .getUserByUsername(username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.userData = data.data;
          this.commonService.setProfileUserData(this.userData);
        },
        error: (error: any) => {
          console.log(error);
          this.router.navigate(['/not-found']);
        },
      });
  }

  @ViewChild('settingsWrapper', { read: ElementRef })
  settingsWrapper!: ElementRef;

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.settingsWrapper) return;

    const target = event.target as Node | null;
    if (!target) {
      this.settingsMenu = false;
      return;
    }

    if (!this.settingsWrapper.nativeElement.contains(target)) {
      this.settingsMenu = false;
    }
  }

  public settingsMenu: boolean = false;
  toggleSettingsMenu() {
    this.settingsMenu = !this.settingsMenu;
  }

  openUploadCoverModal() {
    this.isUploadCoverModalOpen = true;
  }

  closeUploadCoverModal() {
    this.isUploadCoverModalOpen = false;
    this.selectedFile = null;
    this.previewUrl = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastService.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.toastService.error('File size must be less than 5MB');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadCoverImage(): void {
    if (!this.selectedFile) {
      this.toastService.error('Please select an image');
      return;
    }

    this.isUploading = true;
    const formData = new FormData();
    formData.append('File', this.selectedFile);

    this.api
      .uploadPublicFile(formData, 'cover-photos')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isUploading = false;
          this.toastService.success('Cover image uploaded successfully');
          this.closeUploadCoverModal();
          // Refresh user data
          if (this.userData?.userName) {
            this.getUserData(this.userData.userName);
          }
        },
        error: (error: any) => {
          this.isUploading = false;
          this.toastService.error(
            error?.error?.message || 'Failed to upload cover image'
          );
        },
      });
  }

  deleteCoverImage(): void {
    if (!this.userData?.id) return;

    this.isUploading = true;

    this.api
      .deleteFileFromPublic(this.userData.coverPhotoUrl || '')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isUploading = false;
          this.toastService.success('Cover image removed successfully');
          this.closeUploadCoverModal();

          if (this.userData?.userName) {
            this.getUserData(this.userData.userName);
          }
        },
        error: (error: any) => {
          this.isUploading = false;
          this.toastService.error(
            error?.error?.message || 'Failed to delete cover image'
          );
        },
      });
  }

  logout() {
    this.userService.logout();

    this.router.navigate(['/']);
  }
}
