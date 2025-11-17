import { Routes } from '@angular/router';
import { Auth } from '../features/auth/auth';
import { Home } from '../features/home/home';
import { SignupForm } from '../features/auth/auth-components/signup-form/signup-form';
import { SigninForm } from '../features/auth/auth-components/signin-form/signin-form';
import { sendVerificationCodeForm } from '../features/auth/auth-components/send-verification-code-form/send-verification-code-form';
import { EnterCodeForm } from '../features/auth/auth-components/enter-code-form/enter-code-form';
import { NewPasswordForm } from '../features/auth/auth-components/new-password-form/new-password-form';
import { createPasswordGuard } from '../core/guards/create-password-guard';
import { verifyEmailGuard } from '../core/guards/verify-email-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: Auth,
    children: [
      {
        path: '',
        redirectTo: 'signin',
        pathMatch: 'full',
      },
      { path: 'signin', component: SigninForm },
      { path: 'signup', component: SignupForm },
      { path: 'recovery', component: sendVerificationCodeForm },
      {
        path: 'verify-email',
        component: EnterCodeForm,
        canActivate: [verifyEmailGuard],
      },
      {
        path: 'create-new-password',
        component: NewPasswordForm,
        canActivate: [createPasswordGuard],
      },
    ],
  },
  {
    path: 'feed',
    component: Home,
    children: [],
  },
];
