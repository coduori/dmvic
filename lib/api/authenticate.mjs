import { apiConfig } from '../config/api-configs.mjs';
import { makeUnauthenticatedRequest } from '../utils/api-helpers.mjs';
import { getSecret } from '../utils/secrets-handler.mjs';

const authenticate = async () => {
    const requestBody = {
        username: getSecret('username'),
        password: getSecret('password'),
    };
    const response = await makeUnauthenticatedRequest(apiConfig.general.login, requestBody);

    return response;
};

export { authenticate };
