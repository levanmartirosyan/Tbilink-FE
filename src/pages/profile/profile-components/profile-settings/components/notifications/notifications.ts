import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CommonService } from '../../../../../../core/services/common-service';
import { ApiService } from '../../../../../../core/services/api-service';
import { ToastService } from '../../../../../../core/services/toast-service';
import { first } from 'rxjs';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  userData: any;
  isSaving = false;

  notificationSettings = {
    emailNotifications: false,
    pushNotifications: false,
    smsNotifications: false,
    marketingEmails: false,
  };

  initialSettings = { ...this.notificationSettings };

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
        this.notificationSettings = {
          emailNotifications: data.emailNotifications || false,
          pushNotifications: data.pushNotifications || false,
          smsNotifications: data.smsNotifications || false,
          marketingEmails: data.marketingEmails || false,
        };
        this.initialSettings = { ...this.notificationSettings };
      }
    });
  }

  hasChanges(): boolean {
    return (
      JSON.stringify(this.notificationSettings) !==
      JSON.stringify(this.initialSettings)
    );
  }

  onToggleChange(): void {
    if (this.hasChanges()) {
      this.saveNotificationSettings();
    }
  }

  saveNotificationSettings(): void {
    this.isSaving = true;

    const updateData: any = {
      EmailNotifications: this.notificationSettings.emailNotifications,
      PushNotifications: this.notificationSettings.pushNotifications,
      SmsNotifications: this.notificationSettings.smsNotifications,
      MarketingEmails: this.notificationSettings.marketingEmails,
    };

    this.api.updateUser(this.userData.id, updateData).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.toastService.success('Notification settings updated successfully');
        const updatedData = response.data || response;
        this.commonService.setProfileUserData(updatedData);
        this.userData = updatedData;
        this.initialSettings = { ...this.notificationSettings };

        this.getUserData();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.toastService.error(
          error.error?.message || 'Failed to update notification settings'
        );
        console.error('Error updating notification settings:', error);

        this.notificationSettings = { ...this.initialSettings };
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
