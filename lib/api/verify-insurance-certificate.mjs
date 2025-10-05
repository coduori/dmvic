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

    const response = await makeAuthenticatedRequest(
        apiConfig.general.validateInsuranceCertificate,
        requestBody,
        authToken
    );

    return response;
};

export { verifyInsuranceCertificate };
