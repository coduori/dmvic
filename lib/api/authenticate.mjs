import { apiConfig, getAPIBaseURL } from '../config/api-configs.mjs';
import { getSecret } from '../utils/secrets-manager.mjs';
import { invoke } from '../utils/request-handler.mjs';

async function authenticate() {
    let authToken;
    try {
        const body = {
            username: getSecret('username'),
            password: getSecret('password'),
        };

        const APIBaseURL = getAPIBaseURL(getSecret('environment'));
        const { responseBody, statusCode } = await invoke(
            'POST',
            `${APIBaseURL}${apiConfig.general.login}`,
            body,
            null,
            false
        );

        if (statusCode !== 200) {
            throw new Error(`Authentication failed: ${responseBody.Errror}`);
        }

        authToken = responseBody.token;
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
    return authToken;
}

export { authenticate };

/*
TODO:
1. Add logic to handle different error codes from the DMVIC API.
*/
