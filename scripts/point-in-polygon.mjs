function pointInRing(point, ring) {
    const [pointX, pointY] = point;
    let inside = false;
    for (let curr = 0, prev = ring.length - 1; curr < ring.length; prev = curr++) {
        const [currX, currY] = ring[curr];
        const [prevX, prevY] = ring[prev];
        const edgeCrossesHorizontal = currY > pointY !== prevY > pointY;
        const intersectX = ((prevX - currX) * (pointY - currY)) / (prevY - currY) + currX;
        if (edgeCrossesHorizontal && pointX < intersectX) {
            inside = !inside;
        }
    }
    return inside;
}

export function pointInPolygon(point, geometry) {
    if (geometry.type === 'Polygon') {
        const [outerRing, ...holes] = geometry.coordinates;
        return pointInRing(point, outerRing) && holes.every(hole => !pointInRing(point, hole));
    }
    if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates.some(
            ([outerRing, ...holes]) =>
                pointInRing(point, outerRing) && holes.every(hole => !pointInRing(point, hole)),
        );
    }
    return false;
}
