import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideLucideIcons } from '../core/providers/lucide-icons';
import { tokenInterceptor } from '../core/interceptors/token-interceptor';
import { banInterceptor } from '../core/interceptors/ban-interceptor';
import { authInterceptor } from '../core/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([tokenInterceptor, banInterceptor, authInterceptor])
    ),
    provideLucideIcons(),
  ],
};
