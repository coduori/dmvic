import { configureCertificatePath } from '../utils/certManager.mjs';
import { configureSecrets } from '../utils/secretsManager.mjs';

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
        configureCertificatePath(certificates);
    }
};

export {
    // eslint-disable-next-line import/prefer-default-export
    initialize,
};
