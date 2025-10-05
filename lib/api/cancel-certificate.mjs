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

    const response = await makeAuthenticatedRequest(
        apiConfig.general.cancelCertificate,
        requestBody,
        authToken
    );

    return response;
};

export { cancelCertificate };
