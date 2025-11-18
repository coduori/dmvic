import { ValidationError } from 'yup';

import { apiConfig } from '../config/api-configs.mjs';
import { makeAuthenticatedRequest, validateSupportedValues } from '../utils/api-helpers.mjs';
import { validatePayload } from '../utils/config-validation/request-certificate-validation.mjs';
import { yupValidationError } from '../utils/config-validation/validation-error-handler.mjs';
import { MOTOR_CLASS_OPTIONS } from '../utils/constants.mjs';
import { generateInsurancePayload } from '../utils/generate-insurance-payload.mjs';

const requestInsuranceCertificate = async (authToken, certificateRequestPayload, motorClass) => {
    validateSupportedValues(motorClass, Object.values(MOTOR_CLASS_OPTIONS), 'motor class');

    const payloadWithMotorClass = { ...certificateRequestPayload, motorClass };
    try {
        validatePayload(payloadWithMotorClass);
    } catch (error) {
        if (error instanceof ValidationError) {
            return yupValidationError(error);
        }
        throw error;
    }

    const requestBody = generateInsurancePayload(certificateRequestPayload);
    const endpoint = apiConfig.issuance[`type${motorClass}`];

    return makeAuthenticatedRequest(endpoint, requestBody, authToken);
};

export { requestInsuranceCertificate };
