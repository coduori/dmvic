import { getClient } from './http-client.mjs';
import { omitEmptyValues } from './omit-empty-values.mjs';
import { parseDmvicResponse } from './parse-http-response.mjs';
import { getSecret } from './secrets-handler.mjs';

const sendHttpRequest = async ({
    method,
    endpoint,
    requestPayload,
    authToken = null,
    isProtectedEndpoint = true,
}) => {
    if (!authToken && isProtectedEndpoint) {
        throw new Error('An Auth token is required for all authenticated requests!');
    }

    try {
        const headers = {
            authorization: isProtectedEndpoint ? `Bearer ${authToken}` : undefined,
            accept: 'application/json',
            'Content-Type': 'application/json',
            clientId: getSecret('clientid'),
        };
        const sanitizedData = omitEmptyValues(requestPayload);
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
