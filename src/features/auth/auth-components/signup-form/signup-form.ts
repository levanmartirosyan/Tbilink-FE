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
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signup-form',
  imports: [ReactiveFormsModule, AuthButton, AuthInput, RouterModule],
  templateUrl: './signup-form.html',
  styleUrl: './signup-form.scss',
})
export class SignupForm {
  constructor(private api: ApiService) {}

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
      country: new FormControl(''),
      city: new FormControl(''),
      phoneNumber: new FormControl(''),
      profilePhotoUrl: new FormControl(''),
      coverPhotoUrl: new FormControl(''),
      description: new FormControl(''),
    },
    { validators: this.passwordsMatchValidator }
  );

  register() {
    if (!this.registerForm.valid) {
      return;
    }

    console.log(this.registerForm.value);

    // this.api.login(this.loginForm.value).subscribe({
    //   next: (data: ServiceResponse<number>) => {
    //     console.log(data);
    //   },
    //   error: (error: ServiceResponse<number>) => {
    //     console.log(error);
    //   },
    // });
  }

  changeForm(formName: string) {
    this.sendFormName.emit(formName);
  }
}
