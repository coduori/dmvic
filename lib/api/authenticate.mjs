import { apiConfig } from '../config/api-configs.mjs';
import { makeUnauthenticatedRequest } from '../utils/api-helpers.mjs';

const authenticate = async (email, password) => {
    const requestBody = { email, password };
    const response = await makeUnauthenticatedRequest(apiConfig.general.login, requestBody);

    return response;
};

export { authenticate };
