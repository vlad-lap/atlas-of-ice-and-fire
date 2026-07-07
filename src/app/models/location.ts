export interface LocationData {
    id: string;
    name: string;
    type?: string;
    size?: number;
}

export type LocationType = 'cities' | 'towns' | 'greatCastles' | 'castles' | 'ruins' | 'other';

export type LocationDict<T> = Partial<Record<LocationType, T>>;
