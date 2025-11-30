import { Routes } from '@angular/router';
import { Auth } from '../features/auth/auth';
import { Feed } from '../features/feed/feed';
import { SignupForm } from '../features/auth/auth-components/signup-form/signup-form';
import { SigninForm } from '../features/auth/auth-components/signin-form/signin-form';
import { sendVerificationCodeForm } from '../features/auth/auth-components/send-verification-code-form/send-verification-code-form';
import { EnterCodeForm } from '../features/auth/auth-components/enter-code-form/enter-code-form';
import { NewPasswordForm } from '../features/auth/auth-components/new-password-form/new-password-form';
import { createPasswordGuard } from '../core/guards/create-password-guard';
import { verifyEmailGuard } from '../core/guards/verify-email-guard';
import { verifyEmailDeactivateGuard } from '../core/guards/verify-email-deactivate-guard';
import { authGuard } from '../core/guards/auth-guard';
import { authCheckGuard } from '../core/guards/auth-check-guard';
import { Messenger } from '../features/messenger/messenger';
import { Profile } from '../features/profile/profile';
import { Search } from '../features/search/search';
import { ProfileSettings } from '../features/profile/profile-components/profile-settings/profile-settings';
import { Main } from '../features/main/main';

export const routes: Routes = [
  {
    path: '',
    component: Main,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full',
      },
      {
        path: 'feed',
        component: Feed,
        children: [],
      },
      {
        path: 'search',
        component: Search,
        children: [],
      },
      {
        path: 'messenger',
        component: Messenger,
        children: [],
      },
      {
        path: 'profile',
        component: Profile,
        children: [],
      },
      {
        path: 'profile/settings',
        component: ProfileSettings,
      },
    ],
  },
  {
    path: 'auth',
    component: Auth,
    canActivate: [authCheckGuard],
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
        // canDeactivate: [verifyEmailDeactivateGuard],
      },
      {
        path: 'create-new-password',
        component: NewPasswordForm,
        canActivate: [createPasswordGuard],
      },
    ],
  },
];
