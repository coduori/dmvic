const configureSecrets = (secretConfig) => {
    if (!secretConfig || typeof secretConfig !== 'object') {
        throw new Error('Invalid configuration. Expected an object.');
    }

    for (const key of ['username', 'password', 'clientId', 'environment']) {
        if (!(key in secretConfig)) {
            throw new Error(`Missing required key: "${key}" in secrets configuration.`);
        }
    }
    for (const [key, secretPath] of Object.entries(secretConfig)) {
        try {
            if (typeof secretPath === 'object') {
                process.env[`dmvic_${key}`] = JSON.stringify(secretPath);
            } else {
                process.env[`dmvic_${key}`] = secretPath;
            }
        } catch {
            throw new Error(`Error reading certificate "${key}" from path: ${secretPath}`);
        }
    }
};

const getSecret = (key) => {
    if (!process.env[`dmvic_${key}`]) {
        throw new Error(`Secret "${key}" is not configured.`);
    }

    let result = process.env[`dmvic_${key}`];
    if (['redis', 'postgres'].includes(key)) {
        result = JSON.parse(result);
    }
    return result;
};

export { configureSecrets, getSecret };

/*
    TODO:
    1. Add a function to clear the configured secrets from the environment variables.
    2. Ensure Redis is a required config - the library needs to persist the dmvic token for reuse.
*/
