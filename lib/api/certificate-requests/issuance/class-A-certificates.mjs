import { apiConfig, getAPIBaseURL } from '../../../config/api-configs.mjs';
import { invoke } from '../../../utils/request-handler.mjs';
import { getSecret } from '../../../utils/secrets-manager.mjs';
import { generateIssuancePayload } from './generate-issuance-payload.mjs';

const requestClassACertificate = async (authToken, certificateRequestPayload) => {
    if (!authToken) {
        throw new Error('Authentication token is required!');
    }

    // validate payload
    let response;
    try {
        const body = generateIssuancePayload('A', certificateRequestPayload);
        const APIBaseURL = getAPIBaseURL(getSecret('environment'));
        response = await invoke('POST', `${APIBaseURL}${apiConfig.issuance.typeA}`, body, authToken);
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
    return response;
};

export {
    // eslint-disable-next-line import/prefer-default-export
    requestClassACertificate,
};
