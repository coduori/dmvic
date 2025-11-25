import { apiConfig, getApiBaseUrl } from '../config/api-configs.mjs';
import { sendHttpRequest } from './request-handler.mjs';
import { getSecret } from './secrets-handler.mjs';

const validateAuthToken = (authToken) => {
    if (!authToken || typeof authToken !== 'string') {
        throw new Error('Authentication token is required and must be a valid string');
    }

    if (/\s/.test(authToken)) {
        throw new Error('Authentication token cannot contain whitespace characters');
    }
};

const hasCoverageGapError = (response) => {
    return (
        Array.isArray(response?.error) &&
        response.error.some((error) => error.sdkErrorCode === 'COVERAGE_GAP')
    );
};

const makeApiRequest = async (
    endpoint,
    requestBody,
    authToken = null,
    method = 'POST',
    requiresAuth = true
) => {
    const apiBaseUrl = getApiBaseUrl();
    const response = await sendHttpRequest(
        method,
        `${apiBaseUrl}${endpoint}`,
        requestBody,
        authToken,
        requiresAuth
    );

    if (hasCoverageGapError(response)) {
        const coverageGapPolicy = getSecret('coveragegappolicy');
        if (coverageGapPolicy === 'strict') return response;
        return sendHttpRequest(
            method,
            `${apiBaseUrl}${apiConfig.general.confirmIssuance}`,
            { IssuanceRequestID: response.issuanceRequestId }, // should this be generated from the payload generator?
            authToken,
            requiresAuth
        );
    }
    return response;
};

const validateSupportedValues = (value, allowedValues, fieldName) => {
    if (!Array.isArray(allowedValues)) {
        throw new Error(`The "allowedValues" argument must be an array.`);
    }

    if (allowedValues.length === 0) {
        throw new Error(`The "allowedValues" array cannot be empty.`);
    }

    if (!allowedValues.includes(value)) {
        throw new Error(`Invalid ${fieldName}. Must be one of: ${allowedValues.join(', ')}`);
    }
};

const makeAuthenticatedRequest = async (endpoint, requestBody, authToken, method = 'POST') => {
    validateAuthToken(authToken);
    return makeApiRequest(endpoint, requestBody, authToken, method, true);
};

const makeUnauthenticatedRequest = async (endpoint, requestBody, method = 'POST') => {
    return makeApiRequest(endpoint, requestBody, null, method, false);
};

export { makeAuthenticatedRequest, makeUnauthenticatedRequest, validateSupportedValues };
