import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ApolloClientOptions, ApolloLink, InMemoryCache } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { AuthService } from './auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Base fija /admin/: en standalone coincide con el <base> del index.html;
    // embebido en el portal (document.base='/') el provider manda igual.
    { provide: APP_BASE_HREF, useValue: '/admin/' },
    provideRouter(routes),
    provideHttpClient(),
    provideApollo((): ApolloClientOptions<unknown> => {
      const httpLink = inject(HttpLink);
      const auth = inject(AuthService);
      // JWT del gateway → business-service (auditoría: sin token = 401)
      const authLink = setContext(() => {
        const token = auth.token();
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      });
      return {
        link: ApolloLink.from([authLink, httpLink.create({ uri: environment.graphqlUrl })]),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
