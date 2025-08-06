function validateEnum(key, value, allowedValues) {
    if (!allowedValues.includes(value)) {
        return `${key} must be one of ${allowedValues.join(', ')}.`;
    }
    return undefined;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    validateEnum,
};
