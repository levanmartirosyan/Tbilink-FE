import { Component, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../../../../core/services/api-service';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { AuthButton } from '../auth-button/auth-button';
import { AuthInput } from '../auth-input/auth-input';
import { Router, RouterModule } from '@angular/router';
import { CommonService } from '../../../../core/services/common-service';

@Component({
  selector: 'app-signup-form',
  imports: [ReactiveFormsModule, AuthButton, AuthInput, RouterModule],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss',
})
export class SignupForm {
  constructor(
    private api: ApiService,
    private commonService: CommonService,
    private router: Router
  ) {}

  @Output() sendFormName = new EventEmitter<string>();

  private passwordsMatchValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const repPassword = group.get('repPassword')?.value;

    return password && repPassword && password !== repPassword
      ? { passwordsMismatch: true }
      : null;
  };

  public registerForm: FormGroup = new FormGroup(
    {
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      userName: new FormControl('', [Validators.required]),
      email: new FormControl('', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/),
      ]),
      repPassword: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/),
      ]),
    },
    { validators: this.passwordsMatchValidator }
  );

  register() {
    if (!this.registerForm.valid) {
      return;
    }

    console.log(this.registerForm.value);

    this.api.signup(this.registerForm.value).subscribe({
      next: (data: any) => {
        console.log(data);

        this.commonService.setUserEmailExists(true);

        const formAction = {
          type: 'registration',
          email: this.registerForm.value.email,
          code: '',
        };

        this.commonService.setRecEmail(formAction);

        sessionStorage.setItem('form-action', JSON.stringify(formAction));

        this.router.navigate(['/auth/verify-email']);
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  changeForm(formName: string) {
    this.sendFormName.emit(formName);
  }
}
