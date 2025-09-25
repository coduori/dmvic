import { apiConfig, getAPIBaseURL } from '../config/api-configs.mjs';
import { invoke } from '../utils/request-handler.mjs';
import { getSecret } from '../utils/secrets-handler.mjs';
import { generateInsurancePayload } from '../utils/generate-insurance-payload.mjs';
import { MOTOR_CLASS_OPTIONS } from '../utils/constants.mjs';
import { validatePayload } from '../utils/config-validation/request-certificate-validation.mjs';

const requestInsuranceCertificate = async (authToken, certificateRequestPayload, motorClass) => {
    if (!authToken) {
        throw new Error('Authentication token is required!');
    }

    if (!Object.values(MOTOR_CLASS_OPTIONS).includes(motorClass)) {
        throw new Error(
            `Invalid motor class!. Allowed values are ${Object.values(MOTOR_CLASS_OPTIONS).join(', ')}`
        );
    }

    try {
        certificateRequestPayload.motorClass = motorClass;
        validatePayload(certificateRequestPayload);
    } catch (err) {
        const details = err.errors || [err.message];
        const errorMessage = `Validation failed: ${Array.isArray(details) ? details.join('; ') : details}`;
        const error = new Error(errorMessage);
        error.details = details;
        throw error;
    }

    let response;
    try {
        const body = generateInsurancePayload(certificateRequestPayload);
        const APIBaseURL = getAPIBaseURL(getSecret('environment'));
        response = await invoke(
            'POST',
            `${APIBaseURL}${apiConfig.issuance[`type${motorClass}`]}`,
            body,
            authToken
        );
    } catch (error) {
        throw new Error(`Error fetching data: ${error}`);
    }
    return response;
};

export { requestInsuranceCertificate };
