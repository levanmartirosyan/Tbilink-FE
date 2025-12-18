import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { CommonService } from '../../../../../../core/services/common-service';
import { ApiService } from '../../../../../../core/services/api-service';
import { ToastService } from '../../../../../../core/services/toast-service';
import { UserService } from '../../../../../../core/services/user-service';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { CodeType } from '../../../../../../core/enums/code-types';
import { ModalComponent } from '../../../../../../shared/modal/modal';
import { MaskEmailPipe } from '../../../../../../core/pipes/mask-email-pipe';

@Component({
  selector: 'app-account',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ModalComponent,
    MaskEmailPipe,
  ],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account implements OnInit {
  userData: any;
  isEditingEmail = false;
  isEditingUsername = false;
  isEditingPhone = false;
  isVerifying = false;
  verificationCodeSent = false;
  isSaving = false;

  isDeleteConfirmOpen = false;
  isDeleteVerificationOpen = false;
  isVerifyingDelete = false;
  deleteVerificationSent = false;
  isDeleting = false;

  showPassword = false;

  currentEmail = '';
  currentUsername = '';
  currentPhone = '';
  newEmail = '';
  newUsername = '';
  newPhone = '';
  verificationCode = '';
  otp: string[] = ['', '', '', '', '', ''];
  otpDigits = Array(6).fill(0);
  deleteOtp: string[] = ['', '', '', '', '', ''];

  emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  verifyForm = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
    ]),
  });

  usernameForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30),
    ]),
  });

  phoneForm = new FormGroup({
    phone: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(20),
    ]),
  });

  isChangePasswordOpen = false;
  isChangingPassword = false;
  changePasswordForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [
      Validators.required,
      Validators.pattern(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]).{8,}$/
      ),
    ]),
    repeatNewPassword: new FormControl('', [Validators.required]),
  });

  constructor(
    private commonService: CommonService,
    private api: ApiService,
    private toastService: ToastService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.changePasswordForm.setValidators(
      this.passwordsMatchValidator.bind(this)
    );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  loadUserData(): void {
    this.commonService.getProfileUserData().subscribe((data: any) => {
      if (data) {
        this.userData = data;
        this.currentEmail = data.email || '';
        this.currentUsername = data.userName || '';
        this.currentPhone = data.phoneNumber || '';
      }
    });
  }

  openChangeEmailModal(): void {
    this.isEditingEmail = true;
    this.newEmail = '';
    this.verificationCode = '';
    this.verificationCodeSent = false;
    this.otp = ['', '', '', '', '', ''];
    this.emailForm.reset();
    this.verifyForm.reset();
  }

  closeEmailModal(): void {
    this.isEditingEmail = false;
    this.verificationCodeSent = false;
    this.newEmail = '';
    this.verificationCode = '';
    this.otp = ['', '', '', '', '', ''];
    this.emailForm.reset();
    this.verifyForm.reset();
  }

  openChangeUsernameModal(): void {
    this.isEditingUsername = true;
    this.newUsername = this.currentUsername;
    this.usernameForm.patchValue({ username: this.currentUsername });
  }

  closeUsernameModal(): void {
    this.isEditingUsername = false;
    this.newUsername = '';
    this.usernameForm.reset();
  }

  toggleUsernameModal = (): void => {
    this.closeUsernameModal();
  };

  saveUsername(): void {
    if (!this.usernameForm.valid) {
      this.toastService.error(
        'Please enter a valid username (3-30 characters)'
      );
      return;
    }

    const newUsername = this.usernameForm.value.username || '';

    this.isSaving = true;
    const updateData = {
      UserName: newUsername,
    };

    this.api.updateUser(this.userData.id, updateData).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.toastService.success('Username updated successfully');
        this.currentUsername = newUsername;
        this.closeUsernameModal();
        this.getUserData();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.toastService.error(
          error.error?.message || 'Failed to update username'
        );
        console.error('Error updating username:', error);
      },
    });
  }

  sendVerificationCode(): void {
    if (!this.emailForm.valid) {
      this.toastService.error('Please enter a valid email');
      return;
    }

    this.isVerifying = true;
    const newEmail = this.emailForm.value.email || '';
    const sendCodeForm = {
      email: newEmail,
      codeType: CodeType.EmailChange,
      currentUserId: this.userData.id,
    };

    this.api.sendVerificationCode(sendCodeForm).subscribe({
      next: (response: any) => {
        this.isVerifying = false;
        this.verificationCodeSent = true;
        this.newEmail = newEmail;
        this.toastService.success('Verification code sent to your email');
      },
      error: (error: any) => {
        this.isVerifying = false;
        this.toastService.error(
          error.error?.message || 'Failed to send verification code'
        );
        console.error('Error sending verification code:', error);
      },
    });
  }

  onOtpInput(event: any, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!/^\d$/.test(value)) {
      this.otp[index] = '';
      input.value = '';
      this.updateCodeFormControl();
      return;
    }

    this.otp[index] = value;
    this.updateCodeFormControl();

    const next = input.nextElementSibling as HTMLInputElement;
    if (next) next.focus();
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace') {
      this.otp[index] = '';
      this.updateCodeFormControl();

      if (input.value === '' && index > 0) {
        const prev = input.previousElementSibling as HTMLInputElement;
        if (prev) prev.focus();
      }
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').split('');
    digits.slice(0, 6).forEach((digit, index) => {
      this.otp[index] = digit;
    });
    this.updateCodeFormControl();
  }

  private updateCodeFormControl(): void {
    this.verifyForm.patchValue({ code: this.otp.join('') });
  }

  verifyEmailCode(): void {
    if (!this.verifyForm.valid) {
      this.toastService.error('Please enter the verification code');
      return;
    }

    this.isSaving = true;
    const verifyData = {
      email: this.newEmail,
      code: this.otp.join(''),
    };

    this.api.verifyEmail(verifyData).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.toastService.success('Email verified and updated successfully');
        this.currentEmail = this.newEmail;
        this.closeEmailModal();
        this.getUserData();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.toastService.error(
          error.error?.message || 'Failed to verify email'
        );
        console.error('Error verifying email:', error);
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
          this.userService.updateUserData({
            email: userData.email,
            userName: userData.userName,
          });
          this.loadUserData();
        },
        error: (error: any) => {
          console.log(error);
        },
      });
  }

  deleteAccount(): void {
    this.isDeleteConfirmOpen = true;
  }

  startDeleteVerification(): void {
    if (!this.userData?.email) {
      this.toastService.error('User email not available');
      return;
    }

    this.isVerifyingDelete = true;
    this.deleteOtp = ['', '', '', '', '', ''];

    const payload: any = {
      email: this.userData.email,
      codeType: CodeType.PasswordRecovery,
      currentUserId: this.userData.id,
    };

    this.api.sendVerificationCode(payload).subscribe({
      next: (response: any) => {
        this.isVerifyingDelete = false;
        this.isDeleteVerificationOpen = true;
        this.deleteVerificationSent = true;
        this.focusFirstOtp();
        this.isDeleteConfirmOpen = false;
        this.toastService.success('Verification code sent to your email');
      },
      error: (error: any) => {
        this.isVerifyingDelete = false;
        this.toastService.error(
          error.error?.message || 'Failed to send verification code'
        );
        console.error('Error sending delete verification code:', error);
      },
    });
  }

  sendDeleteVerificationCode(): void {
    if (!this.userData?.email) {
      this.toastService.error('User email not available');
      return;
    }

    this.isVerifyingDelete = true;

    const payload: any = {
      email: this.userData.email,
      codeType: CodeType.PasswordRecovery,
      currentUserId: this.userData.id,
    };

    this.api.sendVerificationCode(payload).subscribe({
      next: (response: any) => {
        this.isVerifyingDelete = false;
        this.isDeleteVerificationOpen = true;
        this.deleteVerificationSent = true;
        this.focusFirstOtp();
        this.toastService.success('Verification code sent to your email');
      },
      error: (error: any) => {
        this.isVerifyingDelete = false;
        this.toastService.error(
          error.error?.message || 'Failed to send verification code'
        );
        console.error('Error sending delete verification code:', error);
      },
    });
  }

  private focusFirstOtp(): void {
    setTimeout(() => {
      const first = document.querySelector(
        '.otp-wrapper .otp-input'
      ) as HTMLInputElement | null;
      if (first) first.focus();
    }, 100);
  }

  closeDeleteVerificationModal(): void {
    this.isDeleteVerificationOpen = false;
    this.deleteVerificationSent = false;
    this.deleteOtp = ['', '', '', '', '', ''];
  }

  onDeleteOtpInput(event: any, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!/^\d$/.test(value)) {
      this.deleteOtp[index] = '';
      input.value = '';
      return;
    }

    this.deleteOtp[index] = value;

    const next = input.nextElementSibling as HTMLInputElement;
    if (next) next.focus();
  }

  confirmDeleteAccount(): void {
    const code = this.deleteOtp.join('');
    if (!/^[0-9]{6}$/.test(code)) {
      this.toastService.error('Please enter the 6-digit verification code');
      return;
    }

    this.isDeleting = true;

    const verifyBody = {
      email: this.userData.email,
      code,
    };

    this.api.verifyEmail(verifyBody).subscribe({
      next: (res: any) => {
        this.api.removeUser(this.userData.id).subscribe({
          next: (r: any) => {
            this.isDeleting = false;
            this.isDeleteVerificationOpen = false;
            this.toastService.success('Account deleted successfully');
            this.userService.logout();
            this.router.navigate(['/auth']);
          },
          error: (err: any) => {
            this.isDeleting = false;
            this.toastService.error(
              err.error?.message || 'Failed to delete account'
            );
            console.error('Error deleting account:', err);
          },
        });
      },
      error: (err: any) => {
        this.isDeleting = false;
        this.toastService.error(err.error?.message || 'Verification failed');
        console.error('Verification failed before delete:', err);
      },
    });
  }

  openChangePhoneModal(): void {
    this.isEditingPhone = true;
    this.newPhone = this.currentPhone;
    this.phoneForm.patchValue({ phone: this.currentPhone });
  }

  closePhoneModal(): void {
    this.isEditingPhone = false;
    this.newPhone = '';
    this.phoneForm.reset();
  }

  savePhone(): void {
    if (!this.phoneForm.valid) {
      this.toastService.error(
        'Please enter a valid phone number (10-20 characters)'
      );
      return;
    }

    const newPhone = this.phoneForm.value.phone || '';

    this.isSaving = true;
    const updateData = {
      PhoneNumber: newPhone,
    };

    this.api.updateUser(this.userData.id, updateData).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.toastService.success('Phone number updated successfully');
        this.currentPhone = newPhone;
        this.closePhoneModal();
        this.getUserData();
      },
      error: (error: any) => {
        this.isSaving = false;
        this.toastService.error(
          error.error?.message || 'Failed to update phone number'
        );
        console.error('Error updating phone number:', error);
      },
    });
  }

  openChangePasswordModal(): void {
    this.changePasswordForm.reset();
    this.isChangePasswordOpen = true;
  }

  closeChangePasswordModal(): void {
    this.isChangePasswordOpen = false;
    this.changePasswordForm.reset();
  }

  private passwordsMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const newPass = control.get('newPassword')?.value;
    const rep = control.get('repeatNewPassword')?.value;
    if (newPass && rep && newPass !== rep) return { passwordsMismatch: true };
    return null;
  }

  submitChangePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.toastService.error('Please fix the errors in the form');
      return;
    }

    const body = {
      oldPassword: this.changePasswordForm.value.oldPassword,
      newPassword: this.changePasswordForm.value.newPassword,
      repeatNewPassword: this.changePasswordForm.value.repeatNewPassword,
    };

    this.isChangingPassword = true;
    this.api.changePassword(body).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.toastService.success('Password changed successfully');
        this.closeChangePasswordModal();
      },
      error: (err: any) => {
        this.isChangingPassword = false;
        this.toastService.error(
          err.error?.message || 'Failed to change password'
        );
        console.error('Error changing password:', err);
      },
    });
  }
}
