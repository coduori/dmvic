import { DMVIC_RESPONSE_ERRORS } from './dmvic-error-responses.mjs';
import { omitEmptyValues } from './omit-empty-values.mjs';

const createDmvicFulfilledResponse = (data, isAuthResponse) => {
    let authResponse;
    if (isAuthResponse) {
        authResponse = {
            token: data.token,
            loginUserId: data.loginUserId,
            issueAt: data.issueAt,
            expires: data.expires,
            code: data.code,
            LoginHistoryId: data.LoginHistoryId,
            firstName: data.firstName,
            lastName: data.lastName,
            loggedinEntityId: data.loggedinEntityId,
            ApimSubscriptionKey: data.ApimSubscriptionKey,
            IndustryTypeId: data.IndustryTypeId,
        };
    }
    return {
        apiRequestNumber: data.APIRequestNumber,
        dmvicRefNumber: data.DMVICRefNo,
        success: data.success || true, // Successful authentication doesn't contain success property
        responseData: authResponse || data.callbackObj,
        requestData: data.Inputs,
    };
};

const getSdkErrorCode = (errorText) => {
    for (const { code, regex } of DMVIC_RESPONSE_ERRORS) {
        if (regex.test(errorText)) {
            return code;
        }
    }
    return 'SDK_UNRECOGNIZED_ERROR';
};

const createDmvicUnfulfilledResponse = (data) => {
    /* 
    DMVIC has two different API error responses.
    Auth endpoints return `code`/`message` for errors; authenticated endpoints return `errorCode`/`errorText` for errors. 
*/
    const Error = data.error ||
        data.Error || [
            {
                errorCode: data.code || data.errorCode,
                errorText: data.message || data.errorText,
            },
        ];

    for (const error of Error) {
        const errorText = error.errorText || error.message;
        error.errorCode = error.errorCode || error.code;
        error.sdkErrorCode = getSdkErrorCode(errorText);
    }

    return {
        apiRequestNumber: data.APIRequestNumber,
        dmvicRefNumber: data.DMVICRefNo,
        success: data.success || false, // Failed authentication doesn't contain success property
        ntsaResponse: data.callbackObj?.NTSAResponse,
        issuanceRequestId: data.callbackObj?.IssuanceRequestID,
        issuanceMessage: data.callbackObj?.IssuanceMessage,
        error: Error,
    };
};

const parseDmvicResponse = ({ responseBody, statusCode }) => {
    let parsedResponse;
    const isSuccessfulAuth = responseBody.code === 1; // Successful authentication has a different payload structure
    if (
        isSuccessfulAuth ||
        (responseBody.success &&
            responseBody?.Error.length === 0 &&
            Object.keys(responseBody.callbackObj).length > 0) // NOTE: Some errors like NTSA have data in the callbackObj object
    ) {
        parsedResponse = createDmvicFulfilledResponse(responseBody, isSuccessfulAuth);
    } else {
        parsedResponse = createDmvicUnfulfilledResponse(responseBody);
    }

    const sanitizedResponse = omitEmptyValues(parsedResponse);
    return { ...sanitizedResponse, httpStatusCode: statusCode };
};

export { parseDmvicResponse };
