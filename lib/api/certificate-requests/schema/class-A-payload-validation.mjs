function validatePayload(schema, payload) {
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
        const value = payload[key];
        const isPresent = value !== undefined && value !== null;

        const required = isRequiredField(rules, payload);

        if (required && !isPresent) {
            errors.push(`${key} is required.`);
            continue;
        }

        if (!isPresent) continue;

        const typeError = validateType(key, rules.type, value);
        if (typeError) {
            errors.push(typeError);
            continue;
        }

        errors.push(...validateValueAgainstRules(key, value, rules));

        const customError = validateCustomRule(key, value, payload, rules);
        if (customError) {
            errors.push(customError);
        }
    }

    return errors;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    validatePayload,
};
