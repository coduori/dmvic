function validateStringLength(key, value, rules) {
    const errors = [];
    if (rules.minLength !== undefined && value.length < rules.minLength) {
        errors.push(`${key} must be at least ${rules.minLength} characters long.`);
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        errors.push(`${key} must be at most ${rules.maxLength} characters long.`);
    }
    return errors;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    validateStringLength,
};
