import _ from 'lodash';
import { createHash } from 'crypto';

function generateHash(feature) {
    return createHash('sha1')
        .update(JSON.stringify(feature.geometry.coordinates))
        .digest('hex')
        .slice(0, 8);
}

function generateId(feature) {
    const { name, type } = feature.properties;
    const kebabType = _.kebabCase(type);
    const kebabName = _.kebabCase(name);
    return [kebabType, kebabName || generateHash(feature)].filter(Boolean).join('-');
}

export function generateIds(data) {
    if (!data) {
        return null;
    }

    return {
        ...data,
        features: data.features.map(feature => ({
            ...feature,
            properties: { ...feature.properties, id: generateId(feature) },
        })),
    };
}
