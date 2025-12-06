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

    return makeAuthenticatedRequest({
        endpoint: apiConfig.general.validateInsuranceCertificate,
        requestPayload: requestBody,
        authToken,
    });
};

export { verifyInsuranceCertificate };
