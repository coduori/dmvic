import { Client } from 'undici';
import path from 'path';
import { readFileSync } from 'fs';

import { authenticate } from './APIs/authentication.mjs';
import { getCertificate, configureCertificatePath } from './certManager.mjs';
import { getSecret, configureSecrets } from './secretsManager.mjs';
import { APIBaseURL } from './config/apiConfig.mjs';

let client;
const getClient = () => {
    if (!client) {
        client = new Client(APIBaseURL, {
            connect: {
                key: readFileSync(path.resolve(getCertificate('sslKey')), 'utf8'),
                cert: readFileSync(path.resolve(getCertificate('sslCert')), 'utf8'),
                requestCert: true,
                rejectUnauthorized: false,
            },
        });
    }
    return client;
};

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
    getClient,
    initialize,
    getSecret,
    getCertificate,
    authenticate,
};
