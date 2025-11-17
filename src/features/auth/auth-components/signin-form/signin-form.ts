import { Component, EventEmitter, Output } from '@angular/core';
import { AuthInput } from '../auth-input/auth-input';
import { AuthButton } from '../auth-button/auth-button';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ServiceResponse } from '../../../../core/interfaces/Response';
import { ApiService } from '../../../../core/services/api-service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-signin-form',
  imports: [AuthInput, AuthButton, ReactiveFormsModule, RouterModule],
  templateUrl: './signin-form.html',
  styleUrl: './signin-form.scss',
})
export class SigninForm {
  constructor(private api: ApiService) {}

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
      return;
    }

    console.log(this.loginForm.value);

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
