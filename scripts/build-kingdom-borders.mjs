export function buildKingdomBorders(kingdoms, continents, islands) {
    const coastlineVertices = new Set();
    for (const source of [continents, islands]) {
        for (const feature of source.features) {
            const rings =
                feature.geometry.type === 'Polygon'
                    ? feature.geometry.coordinates
                    : feature.geometry.coordinates.flat(1);
            for (const ring of rings) {
                for (const [lng, lat] of ring) {
                    coastlineVertices.add(`${lng},${lat}`);
                }
            }
        }
    }

    const seenSegments = new Set();
    const borderLines = [];

    for (const feature of kingdoms.features) {
        const rings =
            feature.geometry.type === 'Polygon'
                ? feature.geometry.coordinates
                : feature.geometry.coordinates.flat(1);
        for (const ring of rings) {
            for (let i = 0; i < ring.length - 1; i++) {
                const a = ring[i];
                const b = ring[i + 1];
                const aKey = `${a[0]},${a[1]}`;
                const bKey = `${b[0]},${b[1]}`;
                if (coastlineVertices.has(aKey) && coastlineVertices.has(bKey)) {
                    continue;
                }
                const segKey = aKey < bKey ? `${aKey}|${bKey}` : `${bKey}|${aKey}`;
                if (!seenSegments.has(segKey)) {
                    seenSegments.add(segKey);
                    borderLines.push([a, b]);
                }
            }
        }
    }

    return {
        type: 'FeatureCollection',
        features: borderLines.map(coordinates => ({
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates },
        })),
    };
}
