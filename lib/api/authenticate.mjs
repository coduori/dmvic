import { apiConfig, getAPIBaseURL } from '../config/apiConfig.mjs';
import { getSecret } from '../utils/secretsManager.mjs';
import { getClient } from '../utils/httpClient.mjs';

async function authenticate() {
    let authToken;
    try {
        const body = {
            username: getSecret('username'),
            password: getSecret('password'),
        };

        const headers = {
            accept: 'application/json',
            'Content-Type': 'application/json',
            clientId: getSecret('clientId'),
        };
        const APIBaseURL = getAPIBaseURL(getSecret('environment'));
        const response = await getClient().request({
            path: `${APIBaseURL}${apiConfig.general.login}`,
            method: 'POST',
            body: JSON.stringify(body),
            headers,
        });
        const responseBody = await response.body.json();

        if (response.statusCode !== 200) {
            throw new Error(`Authentication failed: ${responseBody.message}`);
        }
        authToken = responseBody.token;
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
    return authToken;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    authenticate,
};

/*
TODO:
1. Add logic to handle different error codes from the DMVIC API.
*/
