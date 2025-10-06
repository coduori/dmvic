import { apiConfig } from '../config/api-configs.mjs';
import { makeAuthenticatedRequest } from '../utils/api-helpers.mjs';
import { getAnnualExpiry, getDateToday } from '../utils/standard-date-format.mjs';

const checkInsuranceStatus = async (authToken, { registrationNumber, chassisNumber } = {}) => {
    if (!registrationNumber && !chassisNumber) {
        throw new Error('Either registration number or chassis number is required!');
    }

    const requestBody = {
        vehicleregistrationnumber: registrationNumber,
        chassisnumber: chassisNumber,
        policystartdate: getDateToday(),
        policyenddate: getAnnualExpiry(),
    };

    let response;
    try {
        response = await makeAuthenticatedRequest(
            apiConfig.general.validateDoubleInsurance,
            requestBody,
            authToken
        );
    } catch (error) {
        throw new Error(`Insurance Status Check Failed: ${error.message}`);
    }

    return response;
};

export { checkInsuranceStatus };
