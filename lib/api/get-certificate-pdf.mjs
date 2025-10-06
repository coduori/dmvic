import { apiConfig } from '../config/api-configs.mjs';
import { makeAuthenticatedRequest } from '../utils/api-helpers.mjs';

const getCertificatePdf = async (authToken, certificateNumber) => {
    const requestBody = {
        CertificateNumber: certificateNumber,
    };

    let response;
    try {
        response = await makeAuthenticatedRequest(
            apiConfig.general.getCertificatePDF,
            requestBody,
            authToken
        );
    } catch (error) {
        throw new Error(`Fetch Certificate PDF Failed: ${error.message}`);
    }

    return response;
};

export { getCertificatePdf };
