import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { Store } from '@ngxs/store';
import { GeoJSONSourceComponent, LayerComponent, MapComponent } from '@maplibre/ngx-maplibre-gl';
import {
    LngLatLike,
    MapGeoJSONFeature,
    MapLayerMouseEvent,
    MapMouseEvent,
    Popup,
} from 'maplibre-gl';
import { Point } from 'geojson';
import { GEODATA_URLS } from '../../constants';
import {
    INITIAL_MAP_CENTER,
    POINT_CIRCLE_LAYER_IDS,
    TOUCH_HIT_RADIUS_PX,
    ZoomLevel,
} from './constants';
import { LocationData } from '../../models';
import { GeodataState } from '../../store/geodata';
import {
    LABEL_LAYOUT,
    LABEL_PAINT,
    LINES_PAINT,
    MAP_BOUNDS,
    MAP_STYLE,
    POINTS_PAINT,
    POLYGONS_PAINT,
} from './configs';
import { MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AboutDialogComponent } from '../about-dialog/about-dialog.component';

@Component({
    selector: 'aif-atlas-map',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MapComponent,
        GeoJSONSourceComponent,
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

    protected readonly kingdomsLabelPoints = this.store.selectSignal(
        GeodataState.labelPoints('kingdoms'),
    );

    protected readonly polygonsPaint = POLYGONS_PAINT;
    protected readonly linesPaint = LINES_PAINT;
    protected readonly pointsPaint = POINTS_PAINT;

    protected readonly labelLayout = LABEL_LAYOUT;
    protected readonly labelPaint = LABEL_PAINT;

    private readonly hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    private popup: Popup;

    constructor(
        private store: Store,
        private dialog: MatDialog,
    ) {}

    onHomeClick(): void {
        this.map().mapInstance.flyTo({ center: INITIAL_MAP_CENTER, zoom: ZoomLevel.Low });
    }

    onPointEnter({ target, features }: MapLayerMouseEvent): void {
        if (!this.hasHover) {
            return;
        }

        const feature = features?.[0];
        if (!feature?.properties) {
            return;
        }

        this.showPointTooltip(target, feature);
    }

    onPointLeave(): void {
        this.popup?.remove();
        this.popup = null;
    }

    onMapClick({ target, point: { x, y } }: MapMouseEvent): void {
        if (this.hasHover) {
            return;
        }

        const [feature] = target.queryRenderedFeatures(
            [
                [x - TOUCH_HIT_RADIUS_PX, y - TOUCH_HIT_RADIUS_PX],
                [x + TOUCH_HIT_RADIUS_PX, y + TOUCH_HIT_RADIUS_PX],
            ],
            { layers: POINT_CIRCLE_LAYER_IDS },
        );

        if (!feature?.properties) {
            this.onPointLeave();
            return;
        }

        this.showPointTooltip(target, feature);
    }

    openAboutDialog(): void {
        this.dialog.open(AboutDialogComponent);
    }

    private showPointTooltip(
        map: MapLayerMouseEvent['target'],
        { geometry, properties }: MapGeoJSONFeature,
    ): void {
        const lngLat = (geometry as Point).coordinates as LngLatLike;

        this.popup?.remove();
        this.popup = new Popup({ closeButton: false, closeOnClick: false })
            .setLngLat(lngLat)
            .setDOMContent(this.buildPointTooltip(properties as LocationData))
            .addTo(map);
    }

    private buildPointTooltip({ name, type }: LocationData): HTMLElement {
        const container = document.createElement('div');

        const nameEl = document.createElement('div');
        nameEl.textContent = name;
        container.appendChild(nameEl);

        const typeEl = document.createElement('div');
        typeEl.textContent = type;
        typeEl.style.fontSize = '0.85em';
        container.appendChild(typeEl);

        return container;
    }
}
