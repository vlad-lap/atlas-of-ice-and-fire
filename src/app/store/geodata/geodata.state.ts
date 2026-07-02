import { FeatureCollection } from 'geojson';
import { Action, createSelector, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GetGeodata } from './geodata.actions';
import { Observable, tap } from 'rxjs';
import { GEODATA_URLS } from '../../constants';
import { GeodataStateModel } from '../../models';

@State<GeodataStateModel>({
    name: 'geodata',
    defaults: {},
})
@Injectable()
export class GeodataState {
    static geodata(key: keyof GeodataStateModel) {
        return createSelector(
            [GeodataState],
            (state: GeodataStateModel): FeatureCollection => state[key],
        );
    }

    constructor(private http: HttpClient) {}

    @Action(GetGeodata)
    getGeodata(
        { patchState }: StateContext<GeodataStateModel>,
        { key }: GetGeodata,
    ): Observable<FeatureCollection> {
        return this.http
            .get<FeatureCollection>(GEODATA_URLS[key])
            .pipe(tap(geodata => patchState({ [key]: geodata })));
    }
}
