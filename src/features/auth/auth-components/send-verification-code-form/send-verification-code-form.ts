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
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
    ]),
  });

  recover() {
    if (!this.sendVerificationCodeForm.valid) {
      return;
    }

    console.log(this.sendVerificationCodeForm.value);

    // this.api.login(this.loginForm.value).subscribe({
    //   next: (data: ServiceResponse<number>) => {
    //     console.log(data);
    //   },
    //   error: (error: ServiceResponse<number>) => {
    //     console.log(error);
    //   },
    // });
    // sessionStorage.setItem(
    //   'recover-email',
    //   this.sendVerificationCodeForm.value.email
    // );

    this.commonService.setUserEmailExists(true);

    const formAction = {
      type: 'password-recovery',
      email: this.sendVerificationCodeForm.value.email,
    };

    this.commonService.setRecEmail(formAction);

    sessionStorage.setItem('form-action', JSON.stringify(formAction));

    this.router.navigate(['/auth/verify-email']);
  }

  receiveData(formName: string) {
    this.authAction = formName;
  }
}
