import {
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    ViewContainerRef,
    viewChild,
} from '@angular/core';
import { Store } from '@ngxs/store';
import {
    GeoJSONSourceComponent,
    ImageSourceComponent,
    LayerComponent,
    MapComponent,
} from '@maplibre/ngx-maplibre-gl';
import {
    LngLatLike,
    Map,
    MapGeoJSONFeature,
    MapLayerMouseEvent,
    MapMouseEvent,
    Popup,
} from 'maplibre-gl';
import { Point } from 'geojson';
import { GEODATA_URLS } from '../../constants';
import { INITIAL_MAP_CENTER, TOOLTIP_LAYER_IDS, TOUCH_HIT_RADIUS_PX, ZoomLevel } from './constants';
import {
    GeodataType,
    LineGeodataType,
    LocationData,
    LocationType,
    PolygonGeodataType,
} from '../../models';
import { GeodataState } from '../../store/geodata';
import {
    LABEL_LAYOUT,
    LABEL_PAINT,
    LABELS_MIN_ZOOM,
    LINES_PAINT,
    LOCATIONS_FILTER,
    LOCATIONS_MIN_ZOOM,
    MAP_BOUNDS,
    MAP_STYLE,
    NORTH_GRADIENT_COORDINATES,
    NORTH_GRADIENT_PAINT,
    POINTS_PAINT,
    POLYGONS_PAINT,
} from './configs';
import { MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';
import { MapTooltipComponent } from '../map-tooltip/map-tooltip.component';

@Component({
    selector: 'aif-atlas-map',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MapComponent,
        GeoJSONSourceComponent,
        ImageSourceComponent,
        LayerComponent,
        MatMiniFabButton,
        MatIcon,
        MatIconButton,
    ],
    templateUrl: './atlas-map.component.html',
    styleUrl: './atlas-map.component.scss',
})
export class AtlasMapComponent {
    readonly map = viewChild.required(MapComponent);

    protected readonly mapStyle = MAP_STYLE;
    protected readonly geodataUrls = GEODATA_URLS;
    protected readonly ZoomLevel = ZoomLevel;
    protected readonly maxBounds = MAP_BOUNDS;
    protected readonly initialCenter = INITIAL_MAP_CENTER;

    protected readonly polygonTypes: PolygonGeodataType[] = [
        'continents',
        'mountains',
        'forests',
        'lakes',
        'islands',
    ];
    protected readonly lineTypes: LineGeodataType[] = ['kingdomBorders', 'rivers', 'roads'];

    protected readonly labeledTypes: GeodataType[] = [
        'mountains',
        'forests',
        'lakes',
        'islands',
        'rivers',
        'roads',
        'wall',
    ];

    protected readonly kingdomsLabelPoints = this.store.selectSignal(
        GeodataState.labelPoints('kingdoms'),
    );

    protected readonly polygonsPaint = POLYGONS_PAINT;
    protected readonly linesPaint = LINES_PAINT;
    protected readonly pointsPaint = POINTS_PAINT;

    protected readonly locationTypes: LocationType[] = [
        'cities',
        'towns',
        'greatCastles',
        'castles',
        'ruins',
        'other',
    ];
    protected readonly locationsFilter = LOCATIONS_FILTER;
    protected readonly locationsMinZoom = LOCATIONS_MIN_ZOOM;

    protected readonly labelLayout = LABEL_LAYOUT;
    protected readonly labelPaint = LABEL_PAINT;
    protected readonly labelsMinZoom = LABELS_MIN_ZOOM;

    protected readonly northGradientUrl = this.buildNorthGradientUrl();
    protected readonly northGradientCoordinates = NORTH_GRADIENT_COORDINATES;
    protected readonly northGradientPaint = NORTH_GRADIENT_PAINT;

    private readonly hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    private popup: Popup;
    private tooltipRef: ComponentRef<MapTooltipComponent>;

    constructor(
        private store: Store,
        private dialog: MatDialog,
        private viewContainerRef: ViewContainerRef,
    ) {}

    onMapLoad(map: Map): void {
        map.touchZoomRotate.disableRotation();
    }

    onHomeClick(): void {
        this.map().mapInstance.flyTo({ center: INITIAL_MAP_CENTER, zoom: ZoomLevel.Low });
    }

    onFeatureEnter({ lngLat, target, features }: MapLayerMouseEvent): void {
        if (!this.hasHover) {
            return;
        }

        const feature = features?.[0];
        if (!feature?.properties?.name) {
            return;
        }

        this.showTooltip(target, feature, lngLat);
    }

    onFeatureLeave(): void {
        this.popup?.remove();
        this.popup = null;
        this.tooltipRef?.destroy();
        this.tooltipRef = null;
    }

    onMapClick({ target, lngLat, point: { x, y } }: MapMouseEvent): void {
        if (this.hasHover) {
            return;
        }

        const [feature] = target.queryRenderedFeatures(
            [
                [x - TOUCH_HIT_RADIUS_PX, y - TOUCH_HIT_RADIUS_PX],
                [x + TOUCH_HIT_RADIUS_PX, y + TOUCH_HIT_RADIUS_PX],
            ],
            { layers: TOOLTIP_LAYER_IDS },
        );

        if (!feature?.properties?.name) {
            this.onFeatureLeave();
            return;
        }

        this.showTooltip(target, feature, lngLat);
    }

    openAboutDialog(): void {
        this.dialog.open(AboutDialogComponent);
    }

    private showTooltip(
        map: MapLayerMouseEvent['target'],
        { geometry, properties }: MapGeoJSONFeature,
        lngLat: LngLatLike,
    ): void {
        const anchor = geometry.type === 'Point' ? (geometry.coordinates as LngLatLike) : lngLat;

        this.popup?.remove();
        this.tooltipRef?.destroy();
        this.popup = new Popup({ closeButton: false, closeOnClick: false })
            .setLngLat(anchor)
            .setDOMContent(this.buildTooltip(properties as LocationData))
            .addTo(map);
    }

    private buildNorthGradientUrl(): string {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1, 256);
        return canvas.toDataURL();
    }

    private buildTooltip(location: LocationData): HTMLElement {
        this.tooltipRef = this.viewContainerRef.createComponent(MapTooltipComponent);
        this.tooltipRef.setInput('location', location);
        this.tooltipRef.changeDetectorRef.detectChanges();
        return this.tooltipRef.location.nativeElement;
    }
}
