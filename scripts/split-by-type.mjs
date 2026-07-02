export function splitByType(geodata) {
    const byType = Map.groupBy(geodata.features, f => f.properties.type);

    return Object.fromEntries(
        [...byType.entries()].map(([type, features]) => [type, { ...geodata, features }]),
    );
}
