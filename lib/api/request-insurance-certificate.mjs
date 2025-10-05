import { apiConfig } from '../config/api-configs.mjs';
import { makeAuthenticatedRequest, validateSupportedValues } from '../utils/api-helpers.mjs';
import { validatePayload } from '../utils/config-validation/request-certificate-validation.mjs';
import { MOTOR_CLASS_OPTIONS } from '../utils/constants.mjs';
import { generateInsurancePayload } from '../utils/generate-insurance-payload.mjs';

const requestInsuranceCertificate = async (authToken, certificateRequestPayload, motorClass) => {
    validateSupportedValues(motorClass, Object.values(MOTOR_CLASS_OPTIONS), 'motor class');

    try {
        const payloadWithMotorClass = { ...certificateRequestPayload, motorClass };
        validatePayload(payloadWithMotorClass);
    } catch (err) {
        const details = err.errors || [err.message];
        const errorMessage = `Validation failed: ${Array.isArray(details) ? details.join('; ') : details}`;
        const error = new Error(errorMessage);
        error.details = details;
        throw error;
    }

    const requestBody = generateInsurancePayload(certificateRequestPayload);
    const endpoint = apiConfig.issuance[`type${motorClass}`];

    const response = await makeAuthenticatedRequest(endpoint, requestBody, authToken);

    return response;
};

export { requestInsuranceCertificate };
