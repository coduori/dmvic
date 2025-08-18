import { apiConfig, getAPIBaseURL } from '../config/api-configs.mjs';
import { invoke } from '../utils/request-handler.mjs';
import { getSecret } from '../utils/secrets-manager.mjs';
import { getDateToday, getOneYearFromToday } from '../utils/standard-date-format.mjs';

const checkInsuranceStatus = async (authToken, { registrationNumber, chassisNumber } = {}) => {
    if (!authToken) {
        throw new Error('Authentication token is required!');
    }
    if (!registrationNumber && !chassisNumber) {
        throw new Error('Either registration number or chassis number is required!');
    }
    let response;

    try {
        const body = {
            vehicleregistrationnumber: registrationNumber,
            chassisnumber: chassisNumber,
            policystartdate: getDateToday(),
            policyenddate: getOneYearFromToday(),
        };
        const APIBaseURL = getAPIBaseURL(getSecret('environment'));
        response = await invoke(
            'POST',
            `${APIBaseURL}${apiConfig.general.validateDoubleInsurance}`,
            body,
            authToken
        );
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
    return response;
};

export { checkInsuranceStatus };
