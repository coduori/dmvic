import { configureCertificates } from '../utils/cert-manager.mjs';
import { configureSecrets, getSecret } from '../utils/secrets-manager.mjs';

const initialize = async (config) => {
    if (!config || typeof config !== 'object') {
        throw new Error('Invalid configuration. Expected an object.');
    }

    const { secrets, certificates } = config;

    if (!secrets || !certificates) {
        throw new Error('Configuration must include "secrets" and "certificates".');
    }

    if (secrets) {
        configureSecrets(secrets);
    }
    if (certificates) {
        const configuredEnv = getSecret('environment');
        configureCertificates(certificates, configuredEnv);
    }
};

export { initialize };
