import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CommonService } from '../../../../../../core/services/common-service';
import { ApiService } from '../../../../../../core/services/api-service';
import { ToastService } from '../../../../../../core/services/toast-service';
import { first } from 'rxjs';

@Component({
  selector: 'app-privacy',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
})
export class Privacy implements OnInit {
  userData: any;
  isSaving = false;

  privacySettings = {
    isPublicProfile: false,
    showEmail: false,
    showPhone: false,
    allowTagging: false,
  };

  initialSettings = { ...this.privacySettings };

  constructor(
    private commonService: CommonService,
    private api: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.commonService.getProfileUserData().subscribe((data: any) => {
      if (data) {
        this.userData = data;
        this.privacySettings = {
          isPublicProfile: data.isPublicProfile || false,
          showEmail: data.showEmail || false,
          showPhone: data.showPhone || false,
          allowTagging: data.allowTagging || false,
        };
        this.initialSettings = { ...this.privacySettings };
      }
    });
  }

  hasChanges(): boolean {
    return (
      JSON.stringify(this.privacySettings) !==
      JSON.stringify(this.initialSettings)
    );
  }

  onToggleChange(): void {
    if (this.hasChanges()) {
      this.savePrivacySettings();
    }
  }

  savePrivacySettings(): void {
    this.isSaving = true;

    const updateData: any = {
      IsPublicProfile: this.privacySettings.isPublicProfile,
      ShowEmail: this.privacySettings.showEmail,
      ShowPhone: this.privacySettings.showPhone,
      AllowTagging: this.privacySettings.allowTagging,
    };

    this.api.updateUser(this.userData.id, updateData).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.toastService.success('Privacy settings updated successfully');
        const updatedData = response.data || response;
        this.commonService.setProfileUserData(updatedData);
        this.userData = updatedData;
        this.initialSettings = { ...this.privacySettings };

        this.getUserData();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.toastService.error(
          error.error?.message || 'Failed to update privacy settings'
        );
        console.error('Error updating privacy settings:', error);
        this.privacySettings = { ...this.initialSettings };
      },
    });
  }

  getUserData(): void {
    this.api
      .getUserData()
      .pipe(first())
      .subscribe({
        next: (data: any) => {
          const userData = data.data || data;
          this.userData = userData;
          this.commonService.setProfileUserData(userData);
          this.loadUserData();
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }
}
