import { ResolveFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { inject } from '@angular/core';
import { GetGeodata } from '../store/geodata';
import { GEODATA_URLS } from '../constants';
import { GeodataStateModel } from '../models';

export const mapResolver: ResolveFn<void> = () => {
    const store = inject(Store);
    const actions = Object.keys(GEODATA_URLS).map(
        (key: keyof GeodataStateModel) => new GetGeodata(key),
    );
    return store.dispatch(actions);
};
