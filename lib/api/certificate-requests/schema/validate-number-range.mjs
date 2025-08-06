function validateNumberRange(key, value, rules) {
    const errors = [];
    if (rules.min !== undefined && value < rules.min) {
        errors.push(`${key} must be at least ${rules.min}.`);
    }
    if (rules.max !== undefined && value > rules.max) {
        errors.push(`${key} must be at most ${rules.max}.`);
    }
    return errors;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    validateNumberRange,
};

///  what if the data types passed are not numbers
