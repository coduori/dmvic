import { apiConfig } from '../config/api-configs.mjs';
import { makeAuthenticatedRequest } from '../utils/api-helpers.mjs';

const getCertificatePdf = async (authToken, certificateNumber) => {
    const requestBody = {
        CertificateNumber: certificateNumber,
    };

    const response = await makeAuthenticatedRequest(
        apiConfig.general.getCertificatePDF,
        requestBody,
        authToken
    );

    return response;
};

export { getCertificatePdf };
