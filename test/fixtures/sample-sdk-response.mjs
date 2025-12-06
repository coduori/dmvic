const coverageGapErrorResponse = {
    apiRequestNumber: 'UAT-OJQ0842',
    issuanceRequestId: 'UAT-AAB8761',
    issuanceMessage:
        'If you would like to continue the issuance process with further validation, please contact your technical support.  For the issuance of the certificate without any change in the information, please utilize the endpoint https://uat-api.dmvic.com/api/V5/Integration/ConfirmCertificateIssuance',
    error: [
        {
            errorCode: 'ER007',
            errorText: 'There is a 7 days gap between the previous insurance and the proposed one',
            sdkErrorCode: 'COVERAGE_GAP',
        },
    ],
    httpStatusCode: 200,
    _tokenRefreshed: false,
};

const notFoundErrorResponse = {
    apiRequestNumber: 'UAT-OJQ1095',
    error: [
        {
            errorCode: 'ER0016',
            errorText: 'No Records Found',
            sdkErrorCode: 'NOT_FOUND',
        },
    ],
    httpStatusCode: 200,
    tokenRefreshed: false,
};

const invalidTokenErrorResponse = {
    httpStatusCode: 200,
    error: [
        {
            errorCode: 'ER001',
            errorText: 'Token is expired or invalid',
            sdkErrorCode: 'INVLD_TKN',
        },
    ],
    tokenRefreshed: false,
};

const authError401 = {
    httpStatusCode: 401,
    error: [
        {
            errorCode: 'ER401',
            errorText: 'This error is a rare occurence',
            sdkErrorCode: 'SDK_UNRECOGNIZED_ERROR',
        },
    ],
    tokenRefreshed: false,
};

const successfulAuthresponse = {
    success: true,
    responseData: {
        token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijvbw',
        loginUserId: '60179FFEA',
        issueAt: '2025-12-05T18:16:09.1456652Z',
        expires: '2025-12-12T18:21:09.1224646Z',
        code: 1,
        LoginHistoryId: 2074,
        firstName: 'Testing',
        lastName: 'Credentials',
        loggedinEntityId: 28,
        ApimSubscriptionKey: null,
        IndustryTypeId: 4,
    },
    httpStatusCode: 200,
};

export {
    authError401,
    coverageGapErrorResponse,
    invalidTokenErrorResponse,
    notFoundErrorResponse,
    successfulAuthresponse,
};
