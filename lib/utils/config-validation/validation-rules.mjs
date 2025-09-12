const SECRET_VALIDATION_RULES = {
    requiredKeys: ['username', 'password', 'clientid', 'environment', 'includeoptionaldata'],
    requiredValues: {
        environment: ['sandbox', 'production'],
        includeOptionalData: [true, false],
    },
};

export { SECRET_VALIDATION_RULES };
