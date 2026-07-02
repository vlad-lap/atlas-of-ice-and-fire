import { ILabelSettings } from '@amcharts/amcharts5';

// Latitude of northernmost meaningful object of Westeros
export const WESTEROS_NORTH_LATITUDE = 43;

export const LABEL_GEOMETRY_TYPES = ['LineString', 'MultiLineString', 'Polygon', 'MultiPolygon'];

export const GREY_COLOR = '#5d6d7e';
export const BLACK_COLOR = '#333333';

export const WATER_COLOR = '#90d9ed';
export const WATER_LABEL_COLOR = '#1a6b8a';

export const LAND_COLOR = '#d2fade';
export const LAND_LABEL_COLOR = '#12875f';

export const FOREST_COLOR = '#93cba2';

export const MOUNTAINS_COLORS = {
    1: '#f6f5f4',
    2: '#f4efe3',
    3: '#f3eee2',
    4: '#f1e6d1',
    5: '#ece1cc',
};

export const MOUNTAINS_LABEL_COLOR = '#5a4208';

export const ROADS_COLOR = '#ffa80d';
export const ROADS_LABEL_COLOR = '#bd7c05';

export const LOCATION_RADIUS: Record<number, number> = {
    1: 3,
    2: 4,
    3: 4,
    4: 5,
    5: 7,
};

export const LOCATION_COLORS: Record<string, string> = {
    City: '#ffa80d',
    Town: '#ffa80d',
    Castle: '#5d6d7e',
    Ruin: '#aab7b8',
    Other: '#c9ccd0',
};

export const LABEL_OVERRIDES: Record<string, ILabelSettings> = {
    riverlands: { dy: -15 },
    'the-vale': { dx: -20 },
    'the-westerlands': { dy: -20 },
    crownsland: { dy: -15 },
    'the-reach': { dx: 55, dy: -55 },
    'city-lannisport': { dy: 15 },
    'castle-casterly-rock': { dx: 55, dy: -8 },
    'gods-eye': { dy: -15 },
    'castle-shadow-tower': { dy: 12 },
    'castle-castle-black': { dy: 12 },
    'castle-eastwatch-by-the-sea': { dy: 12 },
    'castle-pyke': { dy: 12 },
};
