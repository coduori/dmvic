const validateSecretsConfig = (configData, requiredKeys, requiredValues = {}) => {
    if (!configData || typeof configData !== 'object' || Array.isArray(configData)) {
        throw new Error('Invalid configuration. Expected a plain object.');
    }

    const errors = [];

    const providedKeys = Object.keys(configData).map((key) => key.toLowerCase().trim());
    const invalidKeys = providedKeys.filter((key) => !requiredKeys.includes(key));
    const missingKeys = requiredKeys.filter((key) => !providedKeys.includes(key));

    if (invalidKeys.length > 0) {
        errors.push(
            `Found one or more invalid keys: ${invalidKeys.join(', ')}. Allowed keys are: ${requiredKeys.join(', ')}.`
        );
    }

    if (missingKeys.length > 0) {
        errors.push(
            `Missing one or more required keys: ${missingKeys.join(', ')}. Expected keys are: ${requiredKeys.join(', ')}.`
        );
    }

    for (const [key, allowedValues] of Object.entries(requiredValues)) {
        if (!allowedValues.includes(configData[key])) {
            errors.push(
                `Invalid value for secret key "${key}". Allowed values: ${allowedValues.join(', ')}.`
            );
        }
    }

    if (errors.length > 0) {
        throw new Error(`Configuration errors: ${errors.join('; ')}`);
    }
};

export { validateSecretsConfig };
