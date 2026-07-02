import { FeatureCollection } from 'geojson';

export interface GeodataStateModel {
    continents?: FeatureCollection;
    kingdoms?: FeatureCollection;
    islands?: FeatureCollection;
    mountains?: FeatureCollection;
    forests?: FeatureCollection;
    lakes?: FeatureCollection;
    rivers?: FeatureCollection;
    roads?: FeatureCollection;
    wall?: FeatureCollection;
    cities?: FeatureCollection;
    towns?: FeatureCollection;
    greatCastles?: FeatureCollection;
    castles?: FeatureCollection;
    ruins?: FeatureCollection;
    otherLocations?: FeatureCollection;
}

export type GeodataDict<T> = Record<keyof GeodataStateModel, T>;

export type PolygonGeodataDict<T> = Pick<
    GeodataDict<T>,
    'continents' | 'kingdoms' | 'islands' | 'mountains' | 'forests' | 'lakes'
>;

export type LineGeodataDict<T> = Pick<GeodataDict<T>, 'rivers' | 'roads' | 'wall'>;

export type PointGeodataDict<T> = Pick<
    GeodataDict<T>,
    'cities' | 'towns' | 'greatCastles' | 'castles' | 'ruins' | 'otherLocations'
>;
