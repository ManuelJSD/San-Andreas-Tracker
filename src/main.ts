import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import * as L from 'leaflet';

// Assign L to window so UMD plugins can attach to it properly in esbuild
(window as any).L = L;

Promise.all([
  // @ts-ignore
  import('leaflet.markercluster'),
  // @ts-ignore
  import('leaflet.featuregroup.subgroup')
]).then(() => {
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
});
