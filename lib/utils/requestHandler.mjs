import { getSecret } from '../secretsManager.mjs';
import { authenticate } from '../api/authenticate.mjs';
import { getClient } from './httpClient.mjs';
import { getCacheKey } from './db/redis.mjs';

const invoke = async (method, endpoint, data, isAuthorised = true) => {
    let token;
    if (isAuthorised) {
        token = await getCacheKey('dmvic:auth:token');
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
