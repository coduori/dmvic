const REQUIRED_KEYS = [
    'username',
    'password',
    'clientId',
    'environment',
];

const ENV_PREFIX = 'DMVIC';
const ENV_SEPARATOR = '_';

const getEnvKey = (key) => `${ENV_PREFIX}${ENV_SEPARATOR}${key.toUpperCase()}`;

const isPlainObject = (obj) => !!(obj && typeof obj === 'object' && !Array.isArray(obj));

const validateConfig = (config) => {
    if (!isPlainObject(config)) {
        throw new Error('Invalid configuration. Expected a plain object.');
    }

    const errors = [];

    // Check for missing or invalid required keys
    for (const key of REQUIRED_KEYS) {
        const value = config[key];
        if (typeof value !== 'string' || !value.trim()) {
            errors.push(`- ${key} (missing or invalid string)`);
        }
    }

    // Check for unexpected (non-required) keys
    const allowedKeySet = new Set(REQUIRED_KEYS);
    for (const key of Object.keys(config)) {
        if (!allowedKeySet.has(key)) {
            errors.push(`- ${key} (unexpected key)`);
        }
    }

    if (errors.length > 0) {
        throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
};

const configureSecrets = (secretConfig, { strict = false } = {}) => {
    validateConfig(secretConfig);
    for (const [key, value] of Object.entries(secretConfig)) {
        const envKey = getEnvKey(key);

        if (strict && Object.hasOwn(process.env, envKey)) {
            throw new Error(`Env var "${envKey}" already exists.`);
        } else if (Object.hasOwn(process.env, envKey)) {
            console.warn(`Warning: Overwriting existing env var "${envKey}"`);
        }

        process.env[envKey] = value.trim();
    }
};

const getSecret = (key) => {
    if (typeof key !== 'string' || !key.trim()) {
        throw new Error('A valid secret key must be provided.');
    }

    const normalizedKey = key.trim();

    if (!REQUIRED_KEYS.includes(normalizedKey)) {
        throw new Error(`"${normalizedKey}" is not a recognized secret key. Allowed keys: ${REQUIRED_KEYS.join(', ')}.`);
    }

    const envKey = getEnvKey(normalizedKey);
    const secret = process.env[envKey];

    if (!secret) {
        throw new Error(`Secret "${normalizedKey}" is not configured in the environment (expected: ${envKey}).`);
    }

    return secret;
};

export {
    configureSecrets,
    getSecret,
    getEnvKey,
    isPlainObject,
    validateConfig,
};
