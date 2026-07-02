import { GeodataStateModel } from '../../models';

export class GetGeodata {
    static readonly type = '[Map] Get geodata';
    constructor(public key: keyof GeodataStateModel) {}
}

export class GetContinents {
    static readonly type = '[Map] Get continents';
}

export class GetKingdoms {
    static readonly type = '[Map] Get kingdoms';
}

export class GetIslands {
    static readonly type = '[Map] Get islands';
}

export class GetLakes {
    static readonly type = '[Map] Get lakes';
}

export class GetRivers {
    static readonly type = '[Map] Get rivers';
}

export class GetLocations {
    static readonly type = '[Map] Get locations';
}

export class GetWall {
    static readonly type = '[Map] Get wall';
}
