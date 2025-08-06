function validateDateFormat(key, value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return `${key} must be a valid date.`;
    }
    return undefined;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    validateDateFormat,
};
