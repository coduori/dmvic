const { readFileSync } = require('fs');
const path = require('path');
const { Client } = require('undici');
const redis = require('redis');

const { APIBaseURL } = require('../config/apiConfig');
const secretsManager = require('../secretsManager');
const certificateManager = require('../certManager');
const { authenticate } = require('../APIs/authentication');

const invoke = async (method, endpoint, data, isAuthorised = true) => {
    const client = new Client(APIBaseURL, {
        connect: {
            key: readFileSync(path.resolve(certificateManager.getCertificate('sslKey')), 'utf8'),
            cert: readFileSync(path.resolve(certificateManager.getCertificate('sslCert')), 'utf8'),
            requestCert: true,
            rejectUnauthorized: false,
        },
    });

    let token;
    if (isAuthorised) {
        const redisClient = redis.createClient(JSON.parse(process.env.DMVIC_redis));
        await redisClient.connect();
        token = await redisClient.get('DMVIC_AUTH_TOKEN');
    }

    if (!token) {
        await authenticate();
        await invoke(method, endpoint, data, isAuthorised);
        return;
    }

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