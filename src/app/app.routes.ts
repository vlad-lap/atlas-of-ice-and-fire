import { Routes } from '@angular/router';
import { MapComponent } from './components';
import { mapResolver } from './resolvers';

export const routes: Routes = [
    {
        path: 'map',
        loadComponent: () => MapComponent,
        resolve: {
            data: mapResolver,
        },
    },
    {
        path: '',
        redirectTo: 'map',
        pathMatch: 'full',
    },
];
