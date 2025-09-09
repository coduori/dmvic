const SECRET_VALIDATION_RULES = {
    requiredKeys: ['username', 'password', 'clientid', 'environment'],
    requiredValues: {
        environment: ['sandbox', 'production'],
    },
};

export { SECRET_VALIDATION_RULES };
