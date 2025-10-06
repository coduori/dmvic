import { apiConfig } from '../config/api-configs.mjs';
import { makeUnauthenticatedRequest } from '../utils/api-helpers.mjs';
import { getSecret } from '../utils/secrets-handler.mjs';

const authenticate = async () => {
    let authToken;
    try {
        const requestBody = {
            username: getSecret('username'),
            password: getSecret('password'),
        };
        const { responseBody } = await makeUnauthenticatedRequest(
            apiConfig.general.login,
            requestBody
        );

        authToken = responseBody.token;
    } catch (error) {
        throw new Error(`Authentication Failed: ${error.message}`);
    }
    return authToken;
};

export { authenticate };
