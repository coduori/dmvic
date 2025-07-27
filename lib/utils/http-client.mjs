import { Client } from 'undici';
import { readFileSync } from 'fs';

import { getAPIBaseURL } from '../config/api-configs.mjs';

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

export { getClient };
