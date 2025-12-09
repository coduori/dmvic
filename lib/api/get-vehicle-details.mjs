import { apiConfig } from '../config/api-configs.mjs';
import { makeAuthenticatedRequest } from '../utils/api-helpers.mjs';

const getVehicleDetails = async (authToken, { registrationNumber } = {}) => {
    if (!registrationNumber) {
        throw new Error('Vehicle registration number is required!');
    }

    const requestBody = {
        VehicleRegistrationNumber: registrationNumber,
    };
    return makeAuthenticatedRequest({
        endpoint: apiConfig.general.getVehicleDetails,
        requestPayload: requestBody,
        authToken,
    });
};

export { getVehicleDetails };
