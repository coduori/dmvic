import { apiConfig, getAPIBaseURL } from '../config/api-configs.mjs';
import { invoke } from '../utils/request-handler.mjs';
import { getSecret } from '../utils/secrets-handler.mjs';
import { CANCELLATION_REASONS } from '../utils/cancellation-reasons.mjs';

const cancelCertificate = async (authToken, certificateNumber, cancellationReason) => {
    if (!authToken) {
        throw new Error('Authentication token is required!');
    }

    if (!CANCELLATION_REASONS[cancellationReason]) {
        throw new Error(
            `${cancellationReason} is not a valid reason. Valid reasons are: ${Object.keys(CANCELLATION_REASONS).join(', ')}`
        );
    }

    let response;
    try {
        const body = {
            CertificateNumber: certificateNumber,
            cancelreasonid: CANCELLATION_REASONS[cancellationReason],
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
