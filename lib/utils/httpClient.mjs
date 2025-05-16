import { Client } from 'undici';
import { readFileSync } from 'fs';

import { getAPIBaseURL } from '../config/apiConfig.mjs';

let client;
const getClient = () => {
    const APIBaseURL = getAPIBaseURL();
    if (!client) {
        client = new Client(APIBaseURL, {
            connect: {
                key: readFileSync(process.env.dmvic_sslKey, 'utf8'),
                cert: readFileSync(process.env.dmvic_sslCert, 'utf8'),
                requestCert: true,
                rejectUnauthorized: false,
            },
        });
    }
    return client;
};

export {
    // eslint-disable-next-line import/prefer-default-export
    getClient,
};
