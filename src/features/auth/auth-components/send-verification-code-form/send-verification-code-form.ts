import { Component } from '@angular/core';
import { AuthButton } from '../auth-button/auth-button';
import { ApiService } from '../../../../core/services/api-service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthInput } from '../auth-input/auth-input';
import { Router, RouterModule } from '@angular/router';

import { CommonService } from '../../../../core/services/common-service';
import { CodeType } from '../../../../core/enums/code-types';

@Component({
  selector: 'app-send-verification-code-form',
  imports: [AuthButton, ReactiveFormsModule, AuthInput, RouterModule],
  templateUrl: './send-verification-code-form.html',
  styleUrl: './send-verification-code-form.scss',
})
export class sendVerificationCodeForm {
  constructor(
    private api: ApiService,
    private commonService: CommonService,
    private router: Router
  ) {}

  public authAction: string = 'recovery';

  toggleAuthAction(method: string): void {
    this.authAction = method;
  }

  public sendVerificationCodeForm: FormGroup = new FormGroup({
    codeType: new FormControl(CodeType.PasswordRecovery, [Validators.required]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
    ]),
  });

  sendCode() {
    if (!this.sendVerificationCodeForm.valid) {
      return;
    }

    console.log(this.sendVerificationCodeForm.value);

    this.commonService.setShowLoader(true);

    this.api
      .sendVerificationCode(this.sendVerificationCodeForm.value)
      .subscribe({
        next: (data: any) => {
          this.commonService.setUserEmailExists(true);

          const formAction = {
            type: 'password-recovery',
            email: this.sendVerificationCodeForm.value.email,
            code: '',
          };

          this.commonService.setRecEmail(formAction);

          sessionStorage.setItem('form-action', JSON.stringify(formAction));

          this.commonService.setShowLoader(false);

          this.router.navigate(['/auth/verify-email']);
          console.log(data);
        },
        error: (error: any) => {
          console.log(error);
          this.commonService.setShowLoader(false);
        },
      });
  }

  receiveData(formName: string) {
    this.authAction = formName;
  }
}
