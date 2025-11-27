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
import { CookieService } from 'ngx-cookie-service';
import { SignInRequest } from '../../../../core/interfaces/auth-interfaces';
import { ServiceResponse } from '../../../../core/interfaces/Response';
import { UserService } from '../../../../core/services/user-service';
import { CommonService } from '../../../../core/services/common-service';

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
    private cookies: CookieService,
    private router: Router,
    private commonService: CommonService
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
      return;
    }

    this.commonService.setShowLoader(true);

    this.api.signin(this.loginForm.value).subscribe({
      next: (data: any) => {
        console.log(data.data);

        this.userService.setUser(data.data);

        this.commonService.setShowLoader(false);

        this.router.navigate(['/feed']);
      },
      error: (error: any) => {
        console.log(error);
        this.commonService.setShowLoader(false);
      },
    });
  }

  changeForm(formName: string) {
    this.sendFormName.emit(formName);
  }
}
