import { Routes } from '@angular/router';
import { Auth } from '../pages/auth/auth';
import { Feed } from '../pages/feed/feed';
import { SignupForm } from '../pages/auth/auth-components/signup-form/signup-form';
import { SigninForm } from '../pages/auth/auth-components/signin-form/signin-form';
import { sendVerificationCodeForm } from '../pages/auth/auth-components/send-verification-code-form/send-verification-code-form';
import { EnterCodeForm } from '../pages/auth/auth-components/enter-code-form/enter-code-form';
import { NewPasswordForm } from '../pages/auth/auth-components/new-password-form/new-password-form';
import { createPasswordGuard } from '../core/guards/create-password-guard';
import { verifyEmailGuard } from '../core/guards/verify-email-guard';
import { verifyEmailDeactivateGuard } from '../core/guards/verify-email-deactivate-guard';
import { authGuard } from '../core/guards/auth-guard';
import { authCheckGuard } from '../core/guards/auth-check-guard';
import { Messenger } from '../pages/messenger/messenger';
import { Profile } from '../pages/profile/profile';
import { Search } from '../pages/search/search';
import { ProfileSettings } from '../pages/profile/profile-components/profile-settings/profile-settings';
import { Main } from '../pages/main/main';
import { ProfileInfo } from '../pages/profile/profile-components/profile-settings/components/profile-info/profile-info';
import { Account } from '../pages/profile/profile-components/profile-settings/components/account/account';
import { Privacy } from '../pages/profile/profile-components/profile-settings/components/privacy/privacy';
import { Notifications } from '../pages/profile/profile-components/profile-settings/components/notifications/notifications';
import { Language } from '../pages/profile/profile-components/profile-settings/components/language/language';
import { NotFound } from '../pages/not-found/not-found';
import { Posts } from '../pages/profile/profile-components/posts/posts';
import { Photos } from '../pages/profile/profile-components/photos/photos';
import { Reposts } from '../pages/profile/profile-components/reposts/reposts';
import { About } from '../pages/profile/profile-components/about/about';

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
        path: 'profile/:username',
        component: Profile,
        children: [
          {
            path: '',
            redirectTo: 'posts',
            pathMatch: 'full',
          },
          {
            path: 'posts',
            component: Posts,
          },
          {
            path: 'photos',
            component: Photos,
          },
          {
            path: 'reposts',
            component: Reposts,
          },
          {
            path: 'about',
            component: About,
          },
        ],
      },
      {
        path: 'settings',
        component: ProfileSettings,
        children: [
          {
            path: '',
            redirectTo: 'profile',
            pathMatch: 'full',
          },
          {
            path: 'profile',
            component: ProfileInfo,
          },
          {
            path: 'account',
            component: Account,
          },
          {
            path: 'privacy',
            component: Privacy,
          },
          {
            path: 'notifications',
            component: Notifications,
          },
          {
            path: 'language',
            component: Language,
          },
        ],
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
  {
    path: '**',
    component: NotFound,
  },
];
