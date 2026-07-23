import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readJSON, writeJSON } from './json-utils.mjs';
import { smoothPolygon } from './smooth.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VENDORS = join(__dirname, '..', 'vendors');
const GEODATA = join(__dirname, '..', 'geodata');

const NORMAL_LENGTH = 0.25;
const TAPER_LENGTH = NORMAL_LENGTH;
const LIGHT_DIRECTION = normalize([-1, 1]);

function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}

function add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
}

function scale(v, amount) {
    return [v[0] * amount, v[1] * amount];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}

function normalize(v) {
    const length = Math.hypot(v[0], v[1]);
    return length === 0 ? [0, 0] : [v[0] / length, v[1] / length];
}

function perpendicular(v) {
    return [-v[1], v[0]];
}

function getTangent(points, index) {
    const previous = points[Math.max(index - 1, 0)];
    const next = points[Math.min(index + 1, points.length - 1)];
    return normalize(subtract(next, previous));
}

function getCumulativeDistances(points) {
    const distances = [0];
    for (let i = 1; i < points.length; i++) {
        distances.push(distances[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
    }
    return distances;
}

function getTaperFactors(points) {
    const cumulativeDistances = getCumulativeDistances(points);
    const totalLength = cumulativeDistances[cumulativeDistances.length - 1];

    return cumulativeDistances.map(distance => {
        const distanceFromNearestEnd = Math.min(distance, totalLength - distance);
        return Math.min(distanceFromNearestEnd / TAPER_LENGTH, 1);
    });
}

function getLightSign(lineString) {
    const overallTangent = normalize(subtract(lineString[lineString.length - 1], lineString[0]));
    const perpendicularVector = perpendicular(overallTangent);
    return dot(perpendicularVector, LIGHT_DIRECTION) >= 0 ? 1 : -1;
}

function buildRidgeSide(points, normals, taperFactors, sign) {
    const offsetPoints = points.map((point, index) =>
        add(point, scale(normals[index], sign * NORMAL_LENGTH * taperFactors[index])),
    );
    return [...points, ...offsetPoints.reverse(), points[0]];
}

function buildRidgePolygons(lineString) {
    const lightSign = getLightSign(lineString);
    const lightNormals = lineString.map((point, index) =>
        scale(perpendicular(getTangent(lineString, index)), lightSign),
    );
    const taperFactors = getTaperFactors(lineString);

    return {
        light: buildRidgeSide(lineString, lightNormals, taperFactors, 1),
        dark: buildRidgeSide(lineString, lightNormals, taperFactors, -1),
    };
}

function buildRidgeFeature(feature, shade, rings) {
    return smoothPolygon({
        type: 'Feature',
        properties: { ...feature.properties, shade },
        geometry: {
            type: 'MultiPolygon',
            coordinates: rings.map(ring => [ring]),
        },
    });
}

function buildRidgeFeatures(feature) {
    const lineStrings = feature.geometry.coordinates;
    const polygons = lineStrings.map(buildRidgePolygons);

    return [
        buildRidgeFeature(feature, 'light', polygons.map(({ light }) => light)),
        buildRidgeFeature(feature, 'dark', polygons.map(({ dark }) => dark)),
    ];
}

const mountains = readJSON(join(VENDORS, 'got_mountains.geojson'));

const ridges = {
    type: 'FeatureCollection',
    features: mountains.features.flatMap(buildRidgeFeatures),
};

writeJSON(join(GEODATA, 'got_mountain_ridges.geojson'), ridges);
console.log(`got_mountain_ridges.geojson: ${ridges.features.length} features`);
