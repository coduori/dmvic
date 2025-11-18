import { DMVIC_RESPONSE_ERRORS } from './dmvic-error-responses.mjs';
import { omitEmptyValues } from './omit-empty-values.mjs';

// update omitEmptyValues() to consider cases where the object passed is not flat.
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
        success: data.success || true,
        httpStatusCode: data.statusCode,
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
    Auth endpoints use `code`/`message` for errors; authenticated endpoints use `errorCode`/`errorText` for errors. 
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
        success: data.success,
        ntsaResponse: data.callbackObj?.NTSAResponse,
        issuanceRequestId: data.callbackObj?.IssuanceRequestID,
        issuanceMessage: data.callbackObj?.IssuanceMessage,
        error: Error,
        httpStatusCode: data.statusCode,
    };
};

const parseDmvicResponse = ({ responseBody, statusCode }) => {
    let parsedResponse;
    responseBody.statusCode = statusCode;
    const isSuccessfulAuth = responseBody.code === 1;
    if (
        isSuccessfulAuth ||
        (responseBody.success && Object.keys(responseBody.callbackObj).length > 0)
    ) {
        parsedResponse = createDmvicFulfilledResponse(responseBody, isSuccessfulAuth);
    } else {
        parsedResponse = createDmvicUnfulfilledResponse(responseBody);
    }

    return omitEmptyValues(parsedResponse);
};

export { parseDmvicResponse };
