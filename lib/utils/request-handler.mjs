import { getSecret } from './secrets-manager.mjs';
import { getClient } from './http-client.mjs';

const invoke = async (method, endpoint, data, token = null, isAuthorised = true) => {
    if (!token && isAuthorised) {
        throw new Error('An Auth token is required for all authenticated requests!');
    }

    try {
        const headers = {
            authorization: isAuthorised ? `Bearer ${token}` : undefined,
            accept: 'application/json',
            'Content-Type': 'application/json',
            clientId: getSecret('clientId'),
        };

        const { statusCode, body: response } = await getClient().request({
            path: endpoint,
            method,
            body: JSON.stringify(data),
            headers,
        });

        const responseBody = await response.json();
        return {
            responseBody,
            statusCode,
        };
    } catch (error) {
        throw new Error(`DMVIC Request error: ${error}`);
    }
};

export {
    // eslint-disable-next-line import/prefer-default-export
    invoke,
};
