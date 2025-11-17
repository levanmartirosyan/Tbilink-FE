import { Component, OnInit } from '@angular/core';
import { AuthButton } from '../auth-button/auth-button';
import { AuthInput } from '../auth-input/auth-input';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ApiService } from '../../../../core/services/api-service';
import { CommonService } from '../../../../core/services/common-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-password-form',
  imports: [AuthButton, AuthInput, ReactiveFormsModule],
  templateUrl: './new-password-form.html',
  styleUrl: './new-password-form.scss',
})
export class NewPasswordForm implements OnInit {
  constructor(
    private api: ApiService,
    private commonService: CommonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.commonService.setAuthAction('enter-new-password');
  }

  private passwordsMatchValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const repPassword = group.get('repPassword')?.value;

    return password && repPassword && password !== repPassword
      ? { passwordsMismatch: true }
      : null;
  };

  public newPassForm: FormGroup = new FormGroup({
    // resetToken: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/),
    ]),
    repPassword: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/),
    ]),
  });

  saveNewPassword() {
    if (this.newPassForm.invalid) {
      return;
    }
    console.log(this.newPassForm.value);
    this.router.navigate(['/auth/signin']);
  }
}
