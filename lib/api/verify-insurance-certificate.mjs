import { apiConfig } from '../config/api-configs.mjs';
import { makeAuthenticatedRequest } from '../utils/api-helpers.mjs';

const verifyInsuranceCertificate = async (
    authToken,
    { certificateNumber, vehicleRegistration, chassisNumber }
) => {
    if (!certificateNumber) {
        throw new Error('Certificate number is required!');
    }

    if (!vehicleRegistration && !chassisNumber) {
        throw new Error('Either vehicle registration or chassis number must be provided!');
    }

    const requestBody = {
        CertificateNumber: certificateNumber,
        VehicleRegistrationnumber: vehicleRegistration,
        Chassisnumber: chassisNumber,
    };

    let response;
    try {
        response = await makeAuthenticatedRequest(
            apiConfig.general.validateInsuranceCertificate,
            requestBody,
            authToken
        );
    } catch (error) {
        throw new Error(`Insurance Certificate Verification Failed: ${error.message}`);
    }

    return response;
};

export { verifyInsuranceCertificate };
