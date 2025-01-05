const { readFileSync } = require('fs');
const path = require('path');
const { Client } = require('undici');

const { APIBaseURL } = require('../config/apiConfig');
const secretsManager = require('../secretsManager');
const certificateManager = require('../certManager');

const invoke = async (method, endpoint, data, isAuthorised = true) => {
    const client = new Client(APIBaseURL, {
        connect: {
            key: readFileSync(path.resolve(certificateManager.getCertificate('sslKey')), 'utf8'),
            cert: readFileSync(path.resolve(certificateManager.getCertificate('sslCert')), 'utf8'),
            requestCert: true,
            rejectUnauthorized: false,
        },
    });

    //TODO: add logic to fetch the token from redis for protected endpoints
    let res;
    try {
        const headers = {
            authorization: isAuthorised ? `Bearer ${token}` : undefined,
            accept: 'application/json',
            'Content-Type': 'application/json',
            clientId: secretsManager.getSecret('clientId'),
        };

        res = await client.request({
            path: endpoint,
            method,
            body: JSON.stringify(data),
            headers,
        });
    } catch (error) {
        throw new Error(`DMVIC Request error: ${error}`);

    }

    if (res.statusCode !== 200) {
        const rez = { error: `Failed to fetch data: ${res.statusCode}, ${await res.body.text()}` };
        log.error(rez.error);
        return rez;
    }

    return res.body.json();
};

module.exports =  invoke;