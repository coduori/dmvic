import { apiConfig, getAPIBaseURL } from '../config/api-configs.mjs';
import { invoke } from '../utils/request-handler.mjs';
import { getSecret } from '../utils/secrets-manager.mjs';

const verifyInsuranceCertificate = async (
    authToken,
    { certificateNumber, vehicleRegistration, chassisNumber }
) => {
    if (!authToken) {
        throw new Error('Authentication token is required!');
    }

    if (!certificateNumber) {
        throw new Error('Certificate number is required!');
    }

    if (!vehicleRegistration && !chassisNumber) {
        throw new Error('Either vehicle registration or chassis number must be provided!');
    }
    let response;
    try {
        const body = {
            CertificateNumber: certificateNumber,
            VehicleRegistrationnumber: vehicleRegistration,
            Chassisnumber: chassisNumber,
        };
        const APIBaseURL = getAPIBaseURL(getSecret('environment'));
        response = await invoke(
            'POST',
            `${APIBaseURL}${apiConfig.general.validateInsuranceCertificate}`,
            body,
            authToken
        );
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
    return response;
};

export { verifyInsuranceCertificate };
