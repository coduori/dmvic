const SECRET_VALIDATION_RULES = {
    requiredKeys: [
        'username',
        'password',
        'clientid',
        'environment',
        'includeoptionaldata',
        'coveragegappolicy',
    ],
    requiredValues: {
        environment: ['sandbox', 'production'],
        includeoptionaldata: [true, false],
        coveragegappolicy: ['strict', 'bypass'],
    },
};

export { SECRET_VALIDATION_RULES };
