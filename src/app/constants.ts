import { GeodataDict } from './models';

export const GEODATA_URLS: GeodataDict<string> = {
    continents: 'geodata/got_continents.geojson',
    kingdoms: 'geodata/got_political.geojson',
    islands: 'geodata/got_islands.geojson',
    mountains: 'geodata/got_landscape_mountain.geojson',
    forests: 'geodata/got_landscape_forest.geojson',
    lakes: 'geodata/got_lakes.geojson',
    rivers: 'geodata/got_rivers.geojson',
    roads: 'geodata/got_roads.geojson',
    wall: 'geodata/got_wall.geojson',
    cities: 'geodata/got_locations_city.geojson',
    towns: 'geodata/got_locations_town.geojson',
    greatCastles: 'geodata/got_locations_great_castle.geojson',
    castles: 'geodata/got_locations_castle.geojson',
    ruins: 'geodata/got_locations_ruin.geojson',
    otherLocations: 'geodata/got_locations_other.geojson',
};
