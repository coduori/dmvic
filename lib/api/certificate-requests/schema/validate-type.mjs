function isType(value, expectedType) {
    switch (expectedType) {
    case 'string': return typeof value === 'string';
    case 'number': return typeof value === 'number';
    case 'boolean': return typeof value === 'boolean';
    default: return null;
    }
}

function validateType(key, expectedType, value) {
    if (!isType(value, expectedType)) {
        return `${key} must be of type ${expectedType}.`;
    }
    return undefined;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    validateType,
};
