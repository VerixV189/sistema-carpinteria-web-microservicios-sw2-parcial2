import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { singleSpaAngular } from 'single-spa-angular';
import { NgZone } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { AppProps } from 'single-spa';

const lifecycles = singleSpaAngular({
  bootstrapFunction: (singleSpaProps: AppProps) =>
    bootstrapApplication(AppComponent, appConfig),
  template: '<app-root />',
  Router,
  NavigationStart,
  NgZone,
  domElementGetter: () =>
    document.getElementById('admin-slot') ?? document.body,
});

// Standalone (sin single-spa) para `ng serve` directo en dev
if (!(window as any).singleSpaNavigate && !(window as any).__POWERED_BY_SINGLE_SPA__) {
  bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
}

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
