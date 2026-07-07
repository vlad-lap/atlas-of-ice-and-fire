import { GeodataType } from '../../models';

export class GetGeodata {
    static readonly type = '[Map] Get geodata';
    constructor(public key: GeodataType) {}
}
