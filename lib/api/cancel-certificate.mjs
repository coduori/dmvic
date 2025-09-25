import { apiConfig, getAPIBaseURL } from '../config/api-configs.mjs';
import { invoke } from '../utils/request-handler.mjs';
import { getSecret } from '../utils/secrets-handler.mjs';

const cancelCertificate = async (authToken, certificateNumber, cancellationReasonId) => {
    if (!authToken) {
        throw new Error('Authentication token is required!');
    }
    let response;
    try {
        const body = {
            CertificateNumber: certificateNumber,
            cancelreasonid: cancellationReasonId,
        };
        const APIBaseURL = getAPIBaseURL(getSecret('environment'));
        response = await invoke(
            'POST',
            `${APIBaseURL}${apiConfig.general.cancelCertificate}`,
            body,
            authToken
        );
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
    return response;
};

export { cancelCertificate };
