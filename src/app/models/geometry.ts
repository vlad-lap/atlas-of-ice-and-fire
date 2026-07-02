import { LineString, MultiLineString, MultiPolygon, Polygon } from 'geojson';

export type Geometry = LineString | MultiLineString | Polygon | MultiPolygon;
