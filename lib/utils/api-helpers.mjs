import { getApiBaseUrl } from '../config/api-configs.mjs';
import { sendHttpRequest } from './request-handler.mjs';

const validateAuthToken = (authToken) => {
    if (!authToken || typeof authToken !== 'string') {
        throw new Error('Authentication token is required and must be a valid string');
    }

    if (/\s/.test(authToken)) {
        throw new Error('Authentication token cannot contain whitespace characters');
    }
};

const makeApiRequest = async (
    endpoint,
    requestBody,
    authToken = null,
    method = 'POST',
    requiresAuth = true
) => {
    try {
        const apiBaseUrl = getApiBaseUrl();
        const response = await sendHttpRequest(
            method,
            `${apiBaseUrl}${endpoint}`,
            requestBody,
            authToken,
            requiresAuth
        );
        return response;
    } catch (error) {
        throw new Error(`API request failed: ${error.message}`);
    }
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
