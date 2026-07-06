import {
    CircleLayerSpecification,
    FillLayerSpecification,
    ImageSourceSpecification,
    LineLayerSpecification,
    LngLatBoundsLike,
    RasterLayerSpecification,
    StyleSpecification,
    SymbolLayerSpecification,
} from 'maplibre-gl';
import {
    BLACK,
    FontSize,
    FontStyle,
    LabelColor,
    LandscapeColor,
    LocationColor,
    LocationRadius,
    MapBounds,
} from './constants';
import { GeodataDict, LineGeodataDict, PointGeodataDict, PolygonGeodataDict } from '../../models';

export const MAP_STYLE: StyleSpecification = {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {},
    layers: [
        {
            id: 'background',
            type: 'background',
            paint: {
                'background-color': LandscapeColor.Water,
            },
        },
    ],
};

export const MAP_BOUNDS: LngLatBoundsLike = [
    [MapBounds.West, MapBounds.South],
    [MapBounds.East, MapBounds.North],
];

export const NORTH_GRADIENT_COORDINATES: ImageSourceSpecification['coordinates'] = [
    [MapBounds.West, MapBounds.North],
    [MapBounds.East, MapBounds.North],
    [MapBounds.East, MapBounds.North - 4],
    [MapBounds.West, MapBounds.North - 4],
];

export const NORTH_GRADIENT_PAINT: RasterLayerSpecification['paint'] = {
    'raster-fade-duration': 0,
};

export const POLYGONS_PAINT: Partial<PolygonGeodataDict<FillLayerSpecification['paint']>> = {
    continents: {
        'fill-color': LandscapeColor.Land,
    },
    mountains: {
        'fill-color': LandscapeColor.Mountain,
    },
    forests: {
        'fill-color': LandscapeColor.Forest,
        'fill-opacity': 0.5,
    },
    lakes: {
        'fill-color': LandscapeColor.Water,
    },
    islands: {
        'fill-color': LandscapeColor.Land,
    },
};

export const LINES_PAINT: Partial<LineGeodataDict<LineLayerSpecification['paint']>> = {
    rivers: {
        'line-color': LandscapeColor.Water,
    },
    roads: {
        'line-color': LandscapeColor.Road,
    },
    wall: {
        'line-color': LandscapeColor.Wall,
        'line-width': 3,
    },
    kingdomBorders: {
        'line-color': LandscapeColor.KingdomBorder,
        'line-dasharray': [4, 4],
        'line-opacity': 0.6,
    },
};

const DEFAULT_POINTS_PAINT: CircleLayerSpecification['paint'] = {
    'circle-radius': [
        'match',
        ['get', 'size'],
        1,
        LocationRadius.SM,
        2,
        LocationRadius.MD,
        3,
        LocationRadius.MD,
        4,
        LocationRadius.LG,
        5,
        LocationRadius.XL,
        LocationRadius.MD,
    ],
    'circle-stroke-color': BLACK,
    'circle-stroke-width': 1,
};

export const POINTS_PAINT: Partial<PointGeodataDict<CircleLayerSpecification['paint']>> = {
    cities: {
        ...DEFAULT_POINTS_PAINT,
        'circle-color': LocationColor.City,
        'circle-stroke-width': 2,
    },
    towns: {
        ...DEFAULT_POINTS_PAINT,
        'circle-color': LocationColor.Town,
    },
    greatCastles: {
        ...DEFAULT_POINTS_PAINT,
        'circle-radius': LocationRadius.LG,
        'circle-color': LocationColor.Castle,
        'circle-stroke-width': 2,
    },
    castles: {
        ...DEFAULT_POINTS_PAINT,
        'circle-color': LocationColor.Castle,
    },
    ruins: {
        ...DEFAULT_POINTS_PAINT,
        'circle-color': LocationColor.Ruin,
    },
    otherLocations: {
        ...DEFAULT_POINTS_PAINT,
        'circle-color': LocationColor.Other,
    },
};

const DEFAULT_LABEL_LAYOUT: SymbolLayerSpecification['layout'] = {
    'text-field': ['get', 'name'],
    'text-font': [FontStyle.Italic],
    'text-size': FontSize.Small,
};

const DEFAULT_LINE_LABEL_LAYOUT: SymbolLayerSpecification['layout'] = {
    ...DEFAULT_LABEL_LAYOUT,
    'symbol-placement': 'line-center',
};

const DEFAULT_POINT_LABEL_LAYOUT: SymbolLayerSpecification['layout'] = {
    ...DEFAULT_LABEL_LAYOUT,
    'text-font': [FontStyle.Regular],
    'text-size': FontSize.Medium,
    'text-variable-anchor': ['bottom', 'top', 'left', 'right'],
    'text-radial-offset': 0.6,
    'text-justify': 'auto',
};

export const LABEL_LAYOUT: Partial<GeodataDict<SymbolLayerSpecification['layout']>> = {
    mountains: DEFAULT_LABEL_LAYOUT,
    forests: DEFAULT_LABEL_LAYOUT,
    lakes: DEFAULT_LABEL_LAYOUT,
    islands: DEFAULT_LABEL_LAYOUT,
    kingdoms: {
        ...DEFAULT_LABEL_LAYOUT,
        'text-size': FontSize.Large,
        'text-variable-anchor': ['bottom', 'top', 'left', 'right'],
        'text-justify': 'auto',
    },
    rivers: DEFAULT_LINE_LABEL_LAYOUT,
    roads: {
        ...DEFAULT_LINE_LABEL_LAYOUT,
        'text-font': [FontStyle.Bold],
    },
    wall: {
        ...DEFAULT_LINE_LABEL_LAYOUT,
        'text-font': [FontStyle.Bold],
        'text-size': FontSize.Large,
    },
    cities: {
        ...DEFAULT_POINT_LABEL_LAYOUT,
        'text-font': [FontStyle.Bold],
        'text-size': FontSize.Large,
    },
    towns: DEFAULT_POINT_LABEL_LAYOUT,
    greatCastles: {
        ...DEFAULT_POINT_LABEL_LAYOUT,
        'text-font': [FontStyle.Bold],
        'text-size': FontSize.Large,
    },
    castles: DEFAULT_POINT_LABEL_LAYOUT,
    ruins: {
        ...DEFAULT_POINT_LABEL_LAYOUT,
        'text-size': FontSize.Small,
    },
};

export const DEFAULT_LAND_LABEL_PAINT: SymbolLayerSpecification['paint'] = {
    'text-color': LabelColor.Land,
};

export const DEFAULT_WATER_LABEL_PAINT: SymbolLayerSpecification['paint'] = {
    'text-color': LabelColor.Water,
};

export const DEFAULT_POINT_LABEL_PAINT: SymbolLayerSpecification['paint'] = {
    'text-color': LabelColor.Location,
};

export const LABEL_PAINT: Partial<GeodataDict<SymbolLayerSpecification['paint']>> = {
    mountains: { 'text-color': LabelColor.Mountain },
    forests: DEFAULT_LAND_LABEL_PAINT,
    lakes: DEFAULT_WATER_LABEL_PAINT,
    islands: DEFAULT_LAND_LABEL_PAINT,
    kingdoms: { 'text-color': LabelColor.Kingdom },
    rivers: DEFAULT_WATER_LABEL_PAINT,
    roads: { 'text-color': LabelColor.Road },
    wall: { 'text-color': LabelColor.Wall },
    cities: DEFAULT_POINT_LABEL_PAINT,
    towns: DEFAULT_POINT_LABEL_PAINT,
    greatCastles: DEFAULT_POINT_LABEL_PAINT,
    castles: DEFAULT_POINT_LABEL_PAINT,
    ruins: DEFAULT_POINT_LABEL_PAINT,
};
