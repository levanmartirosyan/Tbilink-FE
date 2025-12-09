import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthButton } from '../auth-button/auth-button';
import { ApiService } from '../../../../core/services/api-service';
import { CommonService } from '../../../../core/services/common-service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast-service';

@Component({
  selector: 'app-enter-code-form',
  imports: [ReactiveFormsModule, AuthButton, FormsModule],
  templateUrl: './enter-code-form.html',
  styleUrl: './enter-code-form.scss',
})
export class EnterCodeForm implements OnInit {
  constructor(
    private api: ApiService,
    private commonService: CommonService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getFormAction();
  }

  private getFormAction() {
    const data = sessionStorage.getItem('form-action');
    if (data) {
      this.formAction = JSON.parse(data);
      this.getFormData();
    }
  }

  private getFormData() {
    const email = this.formAction.email;

    this.enterCodeForm.patchValue({ email });
    this.enterCodeForm.patchValue({ code: this.getOtp() });
  }

  private updateCodeFormControl() {
    this.enterCodeForm.patchValue({ code: this.otp.join('') });
  }

  public enterCodeForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
    ]),
  });

  public formAction: any;

  verify() {
    if (!this.enterCodeForm.valid) {
      return;
    }

    this.commonService.setShowLoader(true);

    this.api.verifyEmail(this.enterCodeForm.value).subscribe({
      next: (data: any) => {
        console.log(data);

        if (this.formAction.type === 'password-recovery') {
          this.commonService.setIsEmailVerified(true);
          const formActionData = sessionStorage.getItem('form-action');
          if (formActionData) {
            const formAction = {
              type: 'password-recovery',
              email: this.enterCodeForm.value.email,
              code: this.enterCodeForm.value.code,
            };

            sessionStorage.setItem('form-action', JSON.stringify(formAction));
          }

          this.commonService.setShowLoader(false);

          this.toastService.success('Email verified successfully.');

          this.router.navigate(['/auth/create-new-password']);
        } else if (this.formAction.type === 'registration') {
          this.commonService.setUserEmailExists(false);
          sessionStorage.removeItem('form-action');

          this.commonService.setShowLoader(false);

          this.toastService.success('Email verified successfully.');

          this.router.navigate(['/']);
        } else if (this.formAction.type === 'email-verification-from-signin') {
          sessionStorage.removeItem('form-action');

          this.commonService.setShowLoader(false);

          this.toastService.success(
            'Email verified successfully, Please sign in again.'
          );
          this.router.navigate(['/auth/signin']);
        }
      },
      error: (error: any) => {
        console.log(error);
        this.commonService.setShowLoader(false);
        this.toastService.error(
          error.error.message || 'Verification failed. Please try again.'
        );
      },
    });
  }

  otp: string[] = ['', '', '', '', '', ''];
  otpDigits = Array(6);

  onInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!/^\d$/.test(value)) {
      this.otp[index] = '';
      input.value = '';
      return;
    }

    this.otp[index] = value;

    this.updateCodeFormControl();

    const next = input.nextElementSibling as HTMLInputElement;
    if (next) next.focus();
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
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

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text')?.trim();

    if (!pasted || !/^\d{6}$/.test(pasted)) return;

    const inputs = document.querySelectorAll(
      '.otp-input'
    ) as NodeListOf<HTMLInputElement>;

    pasted.split('').forEach((char, i) => {
      this.otp[i] = char;
      if (inputs[i]) inputs[i].value = char;
    });

    this.updateCodeFormControl();

    inputs[5]?.focus();
  }

  getOtp(): string {
    return this.otp.join('');
  }

  changeForm(formName: string) {}
}
