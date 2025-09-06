import { Client } from 'undici';

import { getAPIBaseURL } from '../config/api-configs.mjs';
import { getCertificate } from './cert-manager.mjs';
import { getSecret } from './secrets-manager.mjs';

let client;

const getClient = () => {
    if (client) return client;

    const APIBaseURL = getAPIBaseURL(getSecret('environment'));
    const sslKey = getCertificate('sslKey');
    const sslCert = getCertificate('sslCert');
    client = new Client(APIBaseURL, {
        connect: {
            key: sslKey,
            cert: sslCert,
            requestCert: true,
            rejectUnauthorized: true,
        },
    });

    return client;
};

const resetClient = () => {
    client = undefined;
};
getClient.reset = resetClient;

export { getClient };
