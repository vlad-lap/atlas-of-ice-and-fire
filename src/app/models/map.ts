import { ICircleSettings, ILabelSettings } from '@amcharts/amcharts5';

export interface LocationData {
    id: string;
    name: string;
    type: string;
    size: number;
}

export interface LabelData {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    angle: number;
}

export interface LabelSeriesOptions {
    visibleAboveZoom?: number;
    visibleBelowZoom?: number;
    overrides?: Partial<ILabelSettings>;
}

export interface PointSeriesOptions {
    visibleAboveZoom?: number;
    showLabels?: boolean;
    bulletOverrides?: Partial<ICircleSettings>;
    labelOverrides?: Partial<ILabelSettings>;
}

export interface ZoomVisibilityOptions {
    minZoom?: number;
    maxZoom?: number;
}

export enum ZoomLevel {
    Initial = 1.8,
    Low = 3,
    Medium = 4,
    High = 6,
    VeryHigh = 9,
}

export enum FontSize {
    Small = 9,
    Medium = 12,
    Large = 14,
}
