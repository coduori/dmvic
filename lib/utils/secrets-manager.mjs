import { inMemoryCache } from './cache.mjs';
import { validateSecretsConfig } from './validation/secrets-validator.mjs';
import { SECRET_VALIDATION_RULES } from './validation/validation-rules.mjs';

const configureSecrets = (secretConfig, cache = inMemoryCache) => {
    validateSecretsConfig(
        secretConfig,
        SECRET_VALIDATION_RULES.requiredKeys,
        SECRET_VALIDATION_RULES.requiredValues
    );

    for (const [key, value] of Object.entries(secretConfig)) {
        const processedKey = key.toLowerCase().trim();
        cache.set(processedKey, value);
    }
};

const getSecret = (key, cache = inMemoryCache) => {
    if (!cache.has(key)) {
        throw new Error(`Secret "${key}" is not configured.`);
    }

    return cache.get(key);
};

export { configureSecrets, getSecret };
