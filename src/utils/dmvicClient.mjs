import { Client } from 'undici';
import { readFileSync } from 'fs';

import { APIBaseURL } from '../config/apiConfig.mjs';

let client;
const getClient = () => {
    if (!client) {
        client = new Client(APIBaseURL, {
            connect: {
                key: readFileSync(process.env.DMVIC_sslKey, 'utf8'),
                cert: readFileSync(process.env.DMVIC_sslCert, 'utf8'),
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
