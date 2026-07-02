export function filterGeodata(geodata, filterFn) {
    if (!geodata) {
        return null;
    }

    return {
        ...geodata,
        features: geodata.features.filter(filterFn),
    };
}
