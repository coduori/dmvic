const SECRET_VALIDATION_RULES = {
    requiredKeys: [
        'username',
        'password',
        'clientid',
        'environment',
        'includeoptionaldata',
        'autoreauthenticate',
    ],
    requiredValues: {
        environment: ['sandbox', 'production'],
        includeoptionaldata: [true, false],
        autoReauthenticate: [true, false],
    },
};

export { SECRET_VALIDATION_RULES };
