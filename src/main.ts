import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { env } from './enviroment/enviroment';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

if (env.production) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
}
