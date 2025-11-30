import { Component, EventEmitter, Output } from '@angular/core';
import { AuthInput } from '../auth-input/auth-input';
import { AuthButton } from '../auth-button/auth-button';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiService } from '../../../../core/services/api-service';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user-service';
import { CommonService } from '../../../../core/services/common-service';
import { ToastService } from '../../../../core/services/toast-service';
import { CodeType } from '../../../../core/enums/code-types';

@Component({
  selector: 'app-signin-form',
  imports: [AuthInput, AuthButton, ReactiveFormsModule, RouterModule],
  templateUrl: './signin-form.html',
  styleUrl: './signin-form.scss',
})
export class SigninForm {
  constructor(
    private api: ApiService,
    private userService: UserService,
    private router: Router,
    private commonService: CommonService,
    private toastService: ToastService
  ) {}

  @Output() sendFormName = new EventEmitter<string>();

  public loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  login() {
    if (!this.loginForm.valid) {
      return this.toastService.error('Please fill in all required fields.');
    }

    this.commonService.setShowLoader(true);

    this.api.signin(this.loginForm.value).subscribe({
      next: (data) => {
        console.log(data.data);

        this.userService.setUser(data.data);

        this.commonService.setShowLoader(false);

        this.router.navigate(['/feed']);
      },
      error: (error: any) => {
        console.log(error);
        this.commonService.setShowLoader(false);
        this.toastService.error(
          error.error.message || 'Sign In failed. Please try again.'
        );

        if (!error.error.data?.isEmailVerified) {
          this.sendVerificationCode();
        }
      },
    });
  }

  changeForm(formName: string) {
    this.sendFormName.emit(formName);
  }

  sendVerificationCode() {
    this.commonService.setUserEmailExists(true);

    const formAction = {
      type: 'email-verification-from-signin',
      email: this.loginForm.value.email,
      code: '',
    };

    this.commonService.setRecEmail(formAction);

    sessionStorage.setItem('form-action', JSON.stringify(formAction));

    const sendCodeForm = {
      codeType: CodeType.EmailVerification,
      email: this.loginForm.value.email,
    };

    this.api.sendVerificationCode(sendCodeForm).subscribe({
      next: (data: any) => {
        console.log(data);

        this.router.navigate(['/auth/verify-email']);
      },
    });
  }
}
