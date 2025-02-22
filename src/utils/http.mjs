import redis from 'redis';

import { getSecret } from '../secretsManager.mjs';
import { authenticate } from '../APIs/authentication.mjs';
import { getClient } from './dmvicClient.mjs';

const invoke = async (method, endpoint, data, isAuthorised = true) => {
    let token;
    if (isAuthorised) {
        const redisClient = redis.createClient(JSON.parse(process.env.DMVIC_redis));
        await redisClient.connect();
        token = await redisClient.get('DMVIC_AUTH_TOKEN');
    }

    if (!token) {
        await authenticate();
        return invoke(method, endpoint, data, isAuthorised);
    }

    let res;
    try {
        const headers = {
            authorization: isAuthorised ? `Bearer ${token}` : undefined,
            accept: 'application/json',
            'Content-Type': 'application/json',
            clientId: getSecret('clientId'),
        };

        const response = await getClient().request({
            path: endpoint,
            method,
            body: JSON.stringify(data),
            headers,
        });
        res = await response.body.json();
        if (res.statusCode !== 200) {
            const errorMessage = await res.body.text();
            throw new Error(`Failed to fetch data: ${res.statusCode}, ${errorMessage}`);
        }
        return res.body.json();
    } catch (error) {
        throw new Error(`DMVIC Request error: ${error}`);
    }
};

export default invoke;
