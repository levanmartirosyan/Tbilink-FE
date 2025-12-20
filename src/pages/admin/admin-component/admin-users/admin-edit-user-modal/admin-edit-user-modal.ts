import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ModalComponent } from '../../../../../shared/modal/modal';
import { CustomSelectComponent } from '../../../../profile/profile-components/profile-settings/components/profile-info/custom-select/custom-select';
import { COUNTRIES } from '../../../../../core/constants/countries';
import { ApiService } from '../../../../../core/services/api-service';
import { ToastService } from '../../../../../core/services/toast-service';
import { env } from '../../../../../enviroment/enviroment';

@Component({
  standalone: true,
  selector: 'app-admin-edit-user-modal',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ModalComponent,
    CustomSelectComponent,
  ],
  templateUrl: './admin-edit-user-modal.html',
  styleUrl: './admin-edit-user-modal.scss',
})
export class AdminEditUserModal implements OnChanges, OnDestroy {
  private destroy$ = new Subject<void>();
  @Input() user: any = null;
  @Input() toggleEditUserModal: (() => void) | null = null;
  @Output() userUpdated = new EventEmitter<void>();

  public env = env;
  public countries = COUNTRIES;
  public roles: string[] = ['User', 'Admin', 'Owner'];
  public avatarFile: File | null = null;
  public filePreview: string = '';
  public isSaving: boolean = false;

  public editForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.minLength(2)]),
    lastName: new FormControl('', [Validators.minLength(2)]),
    country: new FormControl(''),
    city: new FormControl(''),
    description: new FormControl('', [Validators.maxLength(250)]),
    profilePhotoUrl: new FormControl(''),
    role: new FormControl(''),
  });

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) this.initializeForm();
  }

  initializeForm(): void {
    if (!this.user) return;
    this.editForm.patchValue({
      firstName: this.user.firstName || '',
      lastName: this.user.lastName || '',
      country: this.user.country || '',
      city: this.user.city || '',
      description: this.user.description || '',
      profilePhotoUrl: this.user.profilePhotoUrl || '',
      role: this.user.role || '',
    });

    this.filePreview = this.user.profilePhotoUrl
      ? this.env.storageUrl + this.user.profilePhotoUrl
      : '';
    this.avatarFile = null;
  }

  onAvatarChange(event: any): void {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const MAX_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      this.toast.error('File size must be 10 MB or smaller.');
      return;
    }
    this.avatarFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.filePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  onCountryChange(value: string): void {
    this.editForm.patchValue({ country: value });
  }

  onRoleChange(value: string): void {
    this.editForm.patchValue({ role: value });
  }

  saveChanges(): void {
    if (this.editForm.invalid) {
      this.toast.error('Please complete the form before saving.');
      return;
    }
    this.isSaving = true;
    if (this.avatarFile) this.uploadAvatarAndSave();
    else this.updateUser();
  }

  uploadAvatarAndSave(): void {
    if (!this.avatarFile) return this.updateUser();
    const formData = new FormData();
    formData.append('File', this.avatarFile);
    this.api
      .uploadPublicFile(formData, 'user')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const avatarPath = res.data;
          this.editForm.patchValue({ profilePhotoUrl: avatarPath.path });
          this.avatarFile = null;
          this.updateUser();
        },
        error: (err: any) => {
          this.isSaving = false;
          this.toast.error(err.error?.message || 'Failed to upload avatar');
        },
      });
  }

  updateUser(): void {
    if (!this.user) return;
    const updateData: any = {
      FirstName: (this.editForm.value.firstName || '').trim(),
      LastName: (this.editForm.value.lastName || '').trim(),
      Country: this.editForm.value.country || '',
      City: this.editForm.value.city || '',
      Description: this.editForm.value.description || '',
      ProfilePhotoUrl: this.editForm.value.profilePhotoUrl || '',
      Role: this.editForm.value.role || '',
    };

    this.api
      .updateUser(this.user.id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.isSaving = false;
          this.toast.success('User updated successfully');
          this.userUpdated.emit(res.data || res);
          if (this.toggleEditUserModal) this.toggleEditUserModal();
        },
        error: (err: any) => {
          this.isSaving = false;
          this.toast.error(err.error?.message || 'Failed to update user');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
