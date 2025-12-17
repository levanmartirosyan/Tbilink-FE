import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { env } from '../../../../../../enviroment/enviroment';
import { CommonService } from '../../../../../../core/services/common-service';
import { ApiService } from '../../../../../../core/services/api-service';
import { ToastService } from '../../../../../../core/services/toast-service';
import { COUNTRIES } from '../../../../../../core/constants/countries';
import { CustomSelectComponent } from './custom-select/custom-select';
import { count, first } from 'rxjs';
import { UserService } from '../../../../../../core/services/user-service';

@Component({
  selector: 'app-profile-info',
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    CommonModule,
    CustomSelectComponent,
  ],
  templateUrl: './profile-info.html',
  styleUrl: './profile-info.scss',
})
export class ProfileInfo implements OnInit {
  userData: any;
  avatarFile: File | null = null;
  previewUrl: string = '';
  isSaving = false;
  countries = COUNTRIES;
  initialFormValue: any = {};

  public env: any = env;

  constructor(
    public commonService: CommonService,
    private api: ApiService,
    private toastService: ToastService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  profileForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.minLength(2)]),
    lastName: new FormControl('', [Validators.minLength(2)]),
    country: new FormControl(''),
    city: new FormControl(''),
    description: new FormControl('', [Validators.maxLength(250)]),
    profilePhotoUrl: new FormControl(''),
  });

  loadUserData(): void {
    this.commonService.getProfileUserData().subscribe((data: any) => {
      console.log(data);
      if (data) {
        this.userData = data;
        this.previewUrl = data.profilePhotoUrl
          ? this.env.storageUrl + data.profilePhotoUrl
          : 'assets/icons/profile.png';
        this.profileForm.patchValue({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          country: data.country || '',
          city: data.city || '',
          description: data.description || '',
          profilePhotoUrl: data.profilePhotoUrl || '',
        });
        this.userService.updateUserData({
          firstName: data.firstName,
          lastName: data.lastName,
          profilePhotoUrl: data.profilePhotoUrl,
        });

        this.initialFormValue = this.profileForm.value;
      }
    });
  }

  onAvatarChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.avatarFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onCountryChange(value: string): void {
    this.profileForm.patchValue({ country: value });
  }

  uploadAvatar(): void {
    if (!this.avatarFile) return;

    const formData = new FormData();
    formData.append('File', this.avatarFile);
    this.api.uploadPublicFile(formData, 'user').subscribe({
      next: (response: any) => {
        // Get the uploaded file path from response
        const avatarPath = response.data;
        this.profileForm.patchValue({ profilePhotoUrl: avatarPath.path });
        this.avatarFile = null;
      },
      error: (error: any) => {
        this.toastService.error(
          error.error?.message || 'Failed to update avatar'
        );
        console.error('Error updating avatar:', error);
      },
    });
  }

  saveChanges(): void {
    if (this.profileForm.invalid) {
      this.toastService.error(
        'Please fix the errors in the form before saving.'
      );
      return;
    }

    const formChanged =
      JSON.stringify(this.profileForm.value) !==
      JSON.stringify(this.initialFormValue);
    const avatarChanged = this.avatarFile !== null;

    if (!formChanged && !avatarChanged) {
      this.toastService.info('No changes to save');
      return;
    }

    this.isSaving = true;

    if (this.avatarFile) {
      this.uploadAvatarAndSave();
    } else {
      this.updateUserProfile();
    }
  }

  uploadAvatarAndSave(): void {
    if (!this.avatarFile) {
      this.updateUserProfile();
      return;
    }

    const formData = new FormData();
    formData.append('File', this.avatarFile);

    this.api.uploadPublicFile(formData, 'user').subscribe({
      next: (response: any) => {
        const avatarPath = response.data;
        this.profileForm.patchValue({ profilePhotoUrl: avatarPath.path });
        this.avatarFile = null;

        this.updateUserProfile();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.toastService.error(
          error.error?.message || 'Failed to upload avatar'
        );
        console.error('Error uploading avatar:', error);
      },
    });
  }

  updateUserProfile(): void {
    const firstName = this.profileForm.value.firstName?.trim() || '';
    const lastName = this.profileForm.value.lastName?.trim() || '';

    const updateData: any = {
      FirstName: firstName,
      LastName: lastName,
      Country: this.profileForm.value.country || '',
      City: this.profileForm.value.city || '',
      Description: this.profileForm.value.description || '',
      ProfilePhotoUrl: this.profileForm.value.profilePhotoUrl || '',
    };

    this.api.updateUser(this.userData.id, updateData).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.toastService.success('Profile information updated successfully');
        this.commonService.setProfileUserData(response);
        this.userData = response.data;

        this.getUserData();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.toastService.error(
          error.error?.message || 'Failed to update profile'
        );
        console.error('Error updating profile:', error);
      },
    });
  }

  getUserData() {
    this.api
      .getUserData()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          this.userData = data.data;
          this.commonService.setProfileUserData(this.userData);
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }
}
