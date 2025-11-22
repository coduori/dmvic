import { getClient } from './http-client.mjs';
import { omitEmptyValues } from './omit-empty-values.mjs';
import { parseDmvicResponse } from './parse-http-response.mjs';
import { getSecret } from './secrets-handler.mjs';

const sendHttpRequest = async (method, endpoint, data, token = null, isAuthorised = true) => {
    if (!token && isAuthorised) {
        throw new Error('An Auth token is required for all authenticated requests!');
    }

    try {
        const headers = {
            authorization: isAuthorised ? `Bearer ${token}` : undefined,
            accept: 'application/json',
            'Content-Type': 'application/json',
            clientId: getSecret('clientid'),
        };
        const sanitizedData = omitEmptyValues(data);
        const { statusCode, body: response } = await getClient().request({
            path: endpoint,
            method,
            body: JSON.stringify(sanitizedData),
            headers,
        });

        const responseBody = await response.json();
        return parseDmvicResponse({ responseBody, statusCode });
    } catch (error) {
        throw new Error(`DMVIC Request error: ${error}`);
    }
};

export { sendHttpRequest };
