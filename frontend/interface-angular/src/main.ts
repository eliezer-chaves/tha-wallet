import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { httpConfig } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import ptBr from '@angular/common/locales/pt';

registerLocaleData(ptBr);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    ...httpConfig,
    provideAnimations()
    // Outros providers que você precise
  ]
}).catch(err => console.error(err));