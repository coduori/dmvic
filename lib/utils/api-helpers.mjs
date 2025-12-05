/* eslint-disable max-lines-per-function */
import { getApiBaseUrl } from '../config/api-configs.mjs';
import { coverageGapAfterware } from './afterwares/coverage-gap.mjs';
import { reauthenticateAndRetryAfterware } from './afterwares/reauthenticate-and-retry.mjs';
import { sendHttpRequest } from './request-handler.mjs';

const validateAuthToken = (authToken) => {
    if (!authToken || typeof authToken !== 'string') {
        throw new Error('Authentication token is required and must be a valid string');
    }

    if (/\s/.test(authToken)) {
        throw new Error('Authentication token cannot contain whitespace characters');
    }
};

const makeApiRequest = async ({
    endpoint,
    requestPayload,
    authToken = null,
    method = 'POST',
    requiresAuth = true,
    _retryCount = 0,
    afterwares = [],
}) => {
    const apiBaseUrl = getApiBaseUrl();
    const initialResponse = await sendHttpRequest({
        method,
        endpoint: `${apiBaseUrl}${endpoint}`,
        requestPayload,
        authToken,
        isProtectedEndpoint: requiresAuth,
    });

    const retryRequest = (newToken = authToken) =>
        makeApiRequest({
            endpoint,
            requestPayload,
            authToken: newToken || authToken,
            method,
            requiresAuth,
            _retryCount,
            afterwares,
        });

    const context = {
        endpoint,
        requestPayload,
        authToken,
        method,
        requiresAuth,
        retryCount: _retryCount,
        retryRequest,
    };

    let finalResponse = initialResponse;
    for (const afterware of afterwares) {
        const result = await afterware(finalResponse, context);
        if (result !== undefined) {
            finalResponse = result;
        }
    }

    _retryCount = +1;
    return finalResponse;
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
const makeAuthenticatedRequest = async ({
    endpoint,
    requestPayload,
    authToken,
    method = 'POST',
}) => {
    validateAuthToken(authToken);
    return makeApiRequest({
        endpoint,
        requestPayload,
        authToken,
        method,
        requiresAuth: true,
        afterwares: [coverageGapAfterware, reauthenticateAndRetryAfterware],
    });
};

const makeUnauthenticatedRequest = async (endpoint, requestBody, method = 'POST') => {
    return makeApiRequest({
        endpoint,
        requestBody,
        method,
        requiresAuth: false,
    });
};

export { makeAuthenticatedRequest, makeUnauthenticatedRequest, validateSupportedValues };
