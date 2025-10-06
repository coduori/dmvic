import { apiConfig } from '../config/api-configs.mjs';
import { makeAuthenticatedRequest, validateSupportedValues } from '../utils/api-helpers.mjs';
import { CANCELLATION_REASONS } from '../utils/cancellation-reasons.mjs';

const cancelCertificate = async (authToken, certificateNumber, cancellationReason) => {
    validateSupportedValues(
        cancellationReason,
        Object.keys(CANCELLATION_REASONS),
        'cancellation reason'
    );

    const requestBody = {
        CertificateNumber: certificateNumber,
        cancelreasonid: CANCELLATION_REASONS[cancellationReason],
    };

    let response;
    try {
        response = await makeAuthenticatedRequest(
            apiConfig.general.cancelCertificate,
            requestBody,
            authToken
        );
    } catch (error) {
        throw new Error(`Certificate Cancellation Failed: ${error.message}`);
    }

    return response;
};

export { cancelCertificate };
