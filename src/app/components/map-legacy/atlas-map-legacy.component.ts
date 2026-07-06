import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Inject,
    NgZone,
    OnDestroy,
    PLATFORM_ID,
    viewChild,
} from '@angular/core';
import {
    Bullet,
    Circle,
    color,
    ILabelSettings,
    Label,
    p50,
    percent,
    Rectangle,
    Root,
} from '@amcharts/amcharts5';
import {
    IMapLineSettings,
    IMapPolygonSettings,
    MapChart,
    MapLineSeries,
    MapPointSeries,
    MapPolygonSeries,
    MapSeries,
    ZoomControl,
} from '@amcharts/amcharts5/map';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { isPlatformBrowser } from '@angular/common';
import { Store } from '@ngxs/store';
import { GeodataState } from '../../store/geodata';
import { FeatureCollection } from 'geojson';
import { isNil } from 'lodash';
import {
    FontSize,
    Geometry,
    LabelData,
    LabelSeriesOptions,
    LineGeodataDict,
    LocationData,
    PointGeodataDict,
    PointSeriesOptions,
    PolygonGeodataDict,
    ZoomLevel,
    ZoomVisibilityOptions,
} from '../../models';
import {
    BLACK_COLOR,
    FOREST_COLOR,
    GREY_COLOR,
    LABEL_GEOMETRY_TYPES,
    LABEL_OVERRIDES,
    LAND_COLOR,
    LAND_LABEL_COLOR,
    LOCATION_COLORS,
    LOCATION_RADIUS,
    MOUNTAINS_COLORS,
    MOUNTAINS_LABEL_COLOR,
    POINT_HIT_AREA_RADIUS,
    ROADS_COLOR,
    ROADS_LABEL_COLOR,
    WATER_COLOR,
    WATER_LABEL_COLOR,
    WESTEROS_NORTH_LATITUDE,
} from './constants';
import { getCentralPoint, getLabelAngle } from '../../utils';

@Component({
    selector: 'aif-atlas-map-legacy',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './atlas-map-legacy.component.html',
    styleUrl: './atlas-map-legacy.component.scss',
})
export class AtlasMapLegacyComponent implements AfterViewInit, OnDestroy {
    mapElRef = viewChild('map', { read: ElementRef });

    map: MapChart;

    polygonSeries: PolygonGeodataDict<MapPolygonSeries> = {
        continents: null,
        kingdoms: null,
        islands: null,
        mountains: null,
        forests: null,
        lakes: null,
    };

    lineSeries: Partial<LineGeodataDict<MapLineSeries>> = {
        rivers: null,
        roads: null,
        wall: null,
    };

    pointSeries: PointGeodataDict<MapPointSeries> = {
        cities: null,
        towns: null,
        greatCastles: null,
        castles: null,
        ruins: null,
        otherLocations: null,
    };

    private root: Root;
    private northBoundRafId: number;
    private hasHover: boolean = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    constructor(
        // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
        @Inject(PLATFORM_ID) private platformId: Object,
        private zone: NgZone,
        private store: Store,
    ) {}

    ngAfterViewInit(): void {
        this.browserOnly(() => {
            this.createMap();

            // polygon series
            this.createContinents();
            this.createMountains();
            this.createForests();
            this.createLakes();
            this.createIslands();

            // line series
            this.createRivers();
            this.createRoads();
            this.createWall();

            // not visible, used for hover/zoom
            this.createKingdoms();

            // point series
            this.createCities();
            this.createTowns();
            this.createGreatCastles();
            this.createCastles();
            this.createRuins();
            this.createOtherLocations();
        });
    }

    ngOnDestroy(): void {
        this.browserOnly(() => {
            if (!isNil(this.northBoundRafId)) {
                cancelAnimationFrame(this.northBoundRafId);
            }
            this.map?.dispose();
        });
    }

    private browserOnly(f: () => void): void {
        if (isPlatformBrowser(this.platformId)) {
            this.zone.runOutsideAngular(() => f());
        }
    }

    private createMap(): void {
        this.root = Root.new(this.mapElRef().nativeElement, {
            useSafeResolution: false,
        });
        this.root.setThemes([am5themes_Animated.new(this.root)]);

        this.map = this.root.container.children.push(
            MapChart.new(this.root, {
                panX: 'translateX',
                panY: 'translateY',
                wheelX: 'none',
                wheelY: 'zoom',
                minZoomLevel: ZoomLevel.Initial,
                homeZoomLevel: ZoomLevel.Initial,
                homeGeoPoint: { latitude: 10, longitude: 15 },
            }),
        );

        const zoomControl = this.map.set(
            'zoomControl',
            ZoomControl.new(this.root, {
                y: percent(95),
                layer: 10,
            }),
        );
        zoomControl.homeButton.set('visible', true);

        this.map.chartContainer.set(
            'background',
            Rectangle.new(this.root, {
                fill: color(WATER_COLOR),
                fillOpacity: 1,
            }),
        );

        this.northBoundRafId = requestAnimationFrame(this.enforceNorthBound.bind(this));
    }

    private createContinents(): void {
        const continents = this.store.selectSnapshot(GeodataState.geodata('continents'));
        this.polygonSeries.continents = this.createPolygonSeries(continents);
        this.polygonSeries.continents.events.on('datavalidated', () => {
            setTimeout(() => this.map.goHome(), 100);
        });
    }

    private createKingdoms(): void {
        const kingdoms = this.store.selectSnapshot(GeodataState.geodata('kingdoms'));
        this.polygonSeries.kingdoms = this.createPolygonSeries(kingdoms, {
            fill: color(GREY_COLOR),
            fillOpacity: 0,
            strokeOpacity: 0,
        });

        this.addHoverState(this.polygonSeries.kingdoms, {
            fillOpacity: 0.12,
        });

        this.createLabels(kingdoms, {
            visibleBelowZoom: ZoomLevel.Medium,
            overrides: {
                fill: color(LAND_LABEL_COLOR),
                fontStyle: 'italic',
                fontSize: FontSize.Large,
            },
        });
    }

    private createMountains(): void {
        const mountains = this.store.selectSnapshot(GeodataState.geodata('mountains'));
        this.polygonSeries.mountains = this.createPolygonSeries(mountains, {
            strokeOpacity: 0,
        });

        this.polygonSeries.mountains.mapPolygons.template.adapters.add('fill', (_fill, target) => {
            const size = (target.dataItem?.dataContext as LocationData)?.size;
            return color(MOUNTAINS_COLORS[size]);
        });

        this.createLabels(mountains, {
            visibleAboveZoom: ZoomLevel.Low,
            overrides: {
                fill: color(MOUNTAINS_LABEL_COLOR),
                fontStyle: 'italic',
            },
        });
    }

    private createForests(): void {
        const forests = this.store.selectSnapshot(GeodataState.geodata('forests'));
        this.polygonSeries.forests = this.createPolygonSeries(forests, {
            fill: color(FOREST_COLOR),
            fillOpacity: 0.5,
            strokeOpacity: 0,
        });

        this.createLabels(forests, {
            visibleAboveZoom: ZoomLevel.Low,
            overrides: {
                fill: color(LAND_LABEL_COLOR),
                fontStyle: 'italic',
            },
        });
    }

    private createIslands(): void {
        const islands = this.store.selectSnapshot(GeodataState.geodata('islands'));
        this.polygonSeries.islands = this.createPolygonSeries(islands);

        this.createLabels(islands, {
            visibleAboveZoom: ZoomLevel.Medium,
            overrides: {
                fill: color(LAND_LABEL_COLOR),
                fontStyle: 'italic',
            },
        });
    }

    private createLakes(): void {
        const lakes = this.store.selectSnapshot(GeodataState.geodata('lakes'));
        this.polygonSeries.lakes = this.createPolygonSeries(lakes, {
            fill: color(WATER_COLOR),
        });

        this.createLabels(lakes, {
            visibleAboveZoom: ZoomLevel.Low,
            overrides: {
                fill: color(WATER_LABEL_COLOR),
                fontStyle: 'italic',
            },
        });
    }

    private createRivers(): void {
        const rivers = this.store.selectSnapshot(GeodataState.geodata('rivers'));
        this.lineSeries.rivers = this.createLineSeries(rivers, {
            stroke: color(WATER_COLOR),
            strokeWidth: 1,
        });

        this.createLabels(rivers, {
            visibleAboveZoom: ZoomLevel.Low,
            overrides: {
                fill: color(WATER_LABEL_COLOR),
                fontStyle: 'italic',
            },
        });
    }

    private createRoads(): void {
        const roads = this.store.selectSnapshot(GeodataState.geodata('roads'));
        this.lineSeries.roads = this.createLineSeries(roads, {
            stroke: color(ROADS_COLOR),
        });

        this.createLabels(roads, {
            visibleAboveZoom: ZoomLevel.Medium,
            overrides: {
                fill: color(ROADS_LABEL_COLOR),
                fontWeight: 'bold',
            },
        });
    }

    private createWall(): void {
        const wall = this.store.selectSnapshot(GeodataState.geodata('wall'));
        this.lineSeries.wall = this.createLineSeries(wall, {
            stroke: color(GREY_COLOR),
            strokeWidth: 3,
        });

        this.createLabels(wall, {
            overrides: {
                fill: color(BLACK_COLOR),
                dy: -12,
                fontSize: FontSize.Large,
                fontWeight: 'bold',
                rotation: 0,
            },
        });
    }

    private createCities(): void {
        const cities = this.store.selectSnapshot(GeodataState.geodata('cities'));
        this.pointSeries.cities = this.createPointSeries(cities, {
            bulletOverrides: { strokeWidth: 2 },
            labelOverrides: { fontWeight: 'bold', fontSize: FontSize.Large },
        });
    }

    private createTowns(): void {
        const towns = this.store.selectSnapshot(GeodataState.geodata('towns'));
        this.pointSeries.towns = this.createPointSeries(towns, {
            labelOverrides: { fontSize: FontSize.Medium },
        });

        this.showOnZoomLevel(this.pointSeries.towns, { minZoom: ZoomLevel.Medium });
    }

    private createGreatCastles(): void {
        const greatCastles = this.store.selectSnapshot(GeodataState.geodata('greatCastles'));
        this.pointSeries.greatCastles = this.createPointSeries(greatCastles, {
            bulletOverrides: { strokeWidth: 2, radius: 5 },
            labelOverrides: { fontWeight: 'bold', fontSize: FontSize.Large },
        });
    }

    private createCastles(): void {
        const castles = this.store.selectSnapshot(GeodataState.geodata('castles'));
        this.pointSeries.castles = this.createPointSeries(castles, {
            labelOverrides: { fontSize: FontSize.Medium },
        });

        this.showOnZoomLevel(this.pointSeries.castles, { minZoom: ZoomLevel.Medium });
    }

    private createRuins(): void {
        const ruins = this.store.selectSnapshot(GeodataState.geodata('ruins'));
        this.pointSeries.ruins = this.createPointSeries(ruins);
        this.showOnZoomLevel(this.pointSeries.ruins, { minZoom: ZoomLevel.High });
    }

    private createOtherLocations(): void {
        const otherLocations = this.store.selectSnapshot(GeodataState.geodata('otherLocations'));
        this.pointSeries.otherLocations = this.createPointSeries(otherLocations, {
            showLabels: false,
        });

        this.showOnZoomLevel(this.pointSeries.otherLocations, { minZoom: ZoomLevel.VeryHigh });
    }

    private createPolygonSeries(
        geoJSON: FeatureCollection,
        overrides: Partial<IMapPolygonSettings> = {},
    ): MapPolygonSeries {
        const series = this.map.series.push(MapPolygonSeries.new(this.root, { geoJSON }));

        series.mapPolygons.template.setAll({
            fill: color(LAND_COLOR),
            ...overrides,
        });

        return series;
    }

    private createLineSeries(
        geoJSON: FeatureCollection,
        overrides: Partial<IMapLineSettings> = {},
    ): MapLineSeries {
        const series = this.map.series.push(MapLineSeries.new(this.root, { geoJSON }));

        series.mapLines.template.setAll({
            ...overrides,
        });

        return series;
    }

    private createPointSeries(
        geoJSON: FeatureCollection,
        options: PointSeriesOptions = {},
    ): MapPointSeries {
        const { showLabels = true, bulletOverrides = {}, labelOverrides = {} } = options;

        const series = this.map.series.push(MapPointSeries.new(this.root, { geoJSON }));

        series.bullets.push((_root, _series, dataItem) => {
            const { size, type } = dataItem.dataContext as LocationData;

            const circle = Circle.new(this.root, {
                radius: LOCATION_RADIUS[size],
                layer: 1,
                fill: color(LOCATION_COLORS[type]),
                stroke: color(BLACK_COLOR),
                strokeWidth: 1,
                ...bulletOverrides,
            });

            return Bullet.new(this.root, { sprite: circle });
        });

        if (showLabels) {
            series.bullets.push((_root, _series, dataItem) => {
                const { id, size } = dataItem.dataContext as LocationData;
                return this.createLabelBullet({
                    layer: 2,
                    fill: color(BLACK_COLOR),
                    dy: -(LOCATION_RADIUS[size] ?? 3) - 8,
                    ...labelOverrides,
                    ...LABEL_OVERRIDES[id],
                });
            });
        }

        // Extended hit area for touch screens
        series.bullets.push((_root, _series, dataItem) => {
            const { type } = dataItem.dataContext as LocationData;

            const hitArea = Circle.new(this.root, {
                radius: POINT_HIT_AREA_RADIUS,
                layer: 3,
                fill: color(LOCATION_COLORS[type]),
                fillOpacity: 0,
                strokeOpacity: 0,
                interactive: true,
                tooltipText: `{name}\n[fontSize: ${FontSize.Small}px]{type}[/]`,
                showTooltipOn: this.hasHover ? 'hover' : 'click',
            });

            return Bullet.new(this.root, { sprite: hitArea });
        });

        return series;
    }

    private addHoverState(
        series: MapPolygonSeries,
        hoverState: Partial<IMapPolygonSettings>,
    ): void {
        if (this.hasHover) {
            series.mapPolygons.template.setAll({ interactive: true });
            series.mapPolygons.template.states.create('hover', hoverState);
        }
    }

    private createLabels(features: FeatureCollection, options: LabelSeriesOptions = {}): void {
        const { visibleAboveZoom, visibleBelowZoom, overrides } = options;

        const labelSeries = this.map.series.push(
            MapPointSeries.new(this.root, {
                longitudeField: 'longitude',
                latitudeField: 'latitude',
            }),
        );

        labelSeries.bullets.push((_root, _series, dataItem) => {
            const { id, angle } = dataItem.dataContext as LabelData;
            return this.createLabelBullet({
                rotation: angle,
                ...overrides,
                ...LABEL_OVERRIDES[id],
            });
        });

        this.showOnZoomLevel(labelSeries, {
            minZoom: visibleAboveZoom,
            maxZoom: visibleBelowZoom,
        });

        labelSeries.data.setAll(
            features.features
                .filter(f => LABEL_GEOMETRY_TYPES.includes(f.geometry.type) && f.properties?.name)
                .map(f => {
                    const geometry = f.geometry as Geometry;
                    const [longitude, latitude] = getCentralPoint(geometry);
                    const angle = getLabelAngle(geometry);
                    return {
                        longitude,
                        latitude,
                        id: f.properties?.id,
                        name: f.properties?.name,
                        angle,
                    };
                }),
        );
    }

    private createLabelBullet(overrides: Partial<ILabelSettings>): Bullet {
        return Bullet.new(this.root, {
            sprite: Label.new(this.root, {
                text: '{name}',
                populateText: true,
                layer: 1,
                fontSize: FontSize.Small,
                centerX: p50,
                centerY: p50,
                ...overrides,
            }),
        });
    }

    private showOnZoomLevel(series: MapSeries, { minZoom, maxZoom }: ZoomVisibilityOptions): void {
        if (isNil(minZoom) && isNil(maxZoom)) {
            return;
        }

        const isVisible = (zoomLevel: number): boolean => {
            const isAboveMin = isNil(minZoom) || (zoomLevel ?? 1) > minZoom;
            const isBelowMax = isNil(maxZoom) || (zoomLevel ?? 1) <= maxZoom;
            return isAboveMin && isBelowMax;
        };

        series.set('visible', false);
        this.map.on('zoomLevel', zoomLevel => series.set('visible', isVisible(zoomLevel)));
    }

    private enforceNorthBound(): void {
        const northEdge = this.map.convert({ latitude: WESTEROS_NORTH_LATITUDE, longitude: 0 });
        if (Number.isFinite(northEdge.y) && northEdge.y > 0) {
            this.map.set('translateY', (this.map.get('translateY') ?? 0) - northEdge.y);
        }
        this.northBoundRafId = requestAnimationFrame(this.enforceNorthBound.bind(this));
    }
}
