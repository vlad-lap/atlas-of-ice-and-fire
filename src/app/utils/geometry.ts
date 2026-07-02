import { Geometry } from '../models';
import { LineString, MultiLineString, Position } from 'geojson';

export function getLabelAngle(geometry: Geometry): number {
    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
        return 0;
    }

    const longestSegment = getLongestSegment(geometry);
    const midIndex = Math.floor(longestSegment.length / 2);
    const before = longestSegment[Math.max(0, midIndex - 1)];
    const after = longestSegment[Math.min(longestSegment.length - 1, midIndex + 1)];

    let angle = Math.atan2(-(after[1] - before[1]), after[0] - before[0]) * (180 / Math.PI);
    if (angle > 90) {
        angle -= 180;
    }

    if (angle < -90) {
        angle += 180;
    }

    return angle;
}

export function getCentralPoint(geometry: Geometry): Position {
    switch (geometry.type) {
        case 'LineString':
        case 'MultiLineString': {
            const longestSegment = getLongestSegment(geometry);
            return longestSegment[Math.floor(longestSegment.length / 2)];
        }
        case 'Polygon':
            return ringCentroid(geometry.coordinates[0]);
        case 'MultiPolygon': {
            const largestPolygon = geometry.coordinates.reduce((acc, polygon) =>
                polygon[0].length > acc[0].length ? polygon : acc,
            );
            return ringCentroid(largestPolygon[0]);
        }
    }
}

export function getLongestSegment(geometry: LineString | MultiLineString): Position[] {
    const lineSegments =
        geometry.type === 'LineString' ? [geometry.coordinates] : geometry.coordinates;
    return lineSegments.reduce((acc, seg) => (seg.length > acc.length ? seg : acc));
}

export function ringCentroid(ring: Position[]): Position {
    const [totalLon, totalLat] = ring.reduce(
        ([lon, lat], [posLon, posLat]) => [lon + posLon, lat + posLat],
        [0, 0],
    );
    return [totalLon / ring.length, totalLat / ring.length];
}
