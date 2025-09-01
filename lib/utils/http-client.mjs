import { Client } from 'undici';
import { readFileSync } from 'fs';

import { getAPIBaseURL } from '../config/api-configs.mjs';

let client;
const getClient = () => {
    const APIBaseURL = getAPIBaseURL();
    if (!client) {
        client = new Client(APIBaseURL, {
            connect: {
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                key: readFileSync(process.env.dmvic_sslKey, 'utf8'),
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                cert: readFileSync(process.env.dmvic_sslCert, 'utf8'),
                requestCert: true,
                rejectUnauthorized: true,
            },
        });
    }
    return client;
};

export { getClient };
