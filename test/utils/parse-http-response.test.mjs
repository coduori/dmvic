import { jest } from '@jest/globals';
import {
    DMVIC_STATUS_CODES,
    sampleDMVICFailedResponses,
    sampleFailedAuthResponse,
    sampleSuccessAuthResponse,
} from '../fixtures/sample-dmvic-responses.mjs';

const mockOmitEmptyValues = jest.fn((obj) => {
    if (obj == null || typeof obj !== 'object' || Array.isArray(obj)) {
        throw new Error('omitEmptyValues expects a non-array object');
    }
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => Boolean(v)));
});

jest.unstable_mockModule('../../lib/utils/omit-empty-values.mjs', () => ({
    omitEmptyValues: mockOmitEmptyValues,
}));

const { parseDmvicResponse } = await import('../../lib/utils/parse-http-response.mjs');

describe('parseDmvicResponse', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Successful Authentication Response', () => {
        it('should parse successful authentication response correctly', () => {
            const response = parseDmvicResponse({
                responseBody: sampleSuccessAuthResponse,
                statusCode: DMVIC_STATUS_CODES.SUCCESS,
            });

            expect(mockOmitEmptyValues).toHaveBeenCalledTimes(1);
            expect(mockOmitEmptyValues).toHaveBeenCalledWith({
                success: true,
                responseData: sampleSuccessAuthResponse,
            });
            expect(response).toHaveProperty('httpStatusCode');
            expect(response.httpStatusCode).toBe(DMVIC_STATUS_CODES.SUCCESS);

            expect(response).not.toHaveProperty('apiRequestNumber');
            expect(response).not.toHaveProperty('dmvicRefNumber');
            expect(response).not.toHaveProperty('requestData');
        });
        it('should parse failed authentication error response correctly', () => {
            const response = parseDmvicResponse({
                responseBody: sampleFailedAuthResponse,
                statusCode: DMVIC_STATUS_CODES.FAILED,
            });

            expect(mockOmitEmptyValues).toHaveBeenCalledWith({
                success: false,
                error: [
                    {
                        errorCode: sampleFailedAuthResponse.code,
                        errorText: sampleFailedAuthResponse.message,
                        sdkErrorCode: 'INVLD_USR',
                    },
                ],
            });
            expect(response).toHaveProperty('httpStatusCode');
            expect(response.httpStatusCode).toBe(DMVIC_STATUS_CODES.FAILED);
            expect(response).not.toHaveProperty('apiRequestNumber');
            expect(response).not.toHaveProperty('dmvicRefNumber');
            expect(response).not.toHaveProperty('requestData');
            expect(response).not.toHaveProperty('ntsaResponse');
            expect(response).not.toHaveProperty('issuanceRequestId');
            expect(response).not.toHaveProperty('issuanceMessage');
        });
    });

    describe('Unfulfilled Response - Error Handling', () => {
        it.each([
            ['NTSA_CNFLCT', sampleDMVICFailedResponses[0]],
            ['NOT_FOUND', sampleDMVICFailedResponses[1]],
            ['SDK_UNRECOGNIZED_ERROR', sampleDMVICFailedResponses[2]],
            ['INVLD_CERT_PDF', sampleDMVICFailedResponses[3]],
            ['INVLD_CERT', sampleDMVICFailedResponses[4]],
            ['SDK_UNRECOGNIZED_ERROR', sampleDMVICFailedResponses[5]],
        ])(
            'should parse error response with errorCode/errorText format: %s',
            (errorCode, sampleDMVICFailedResponse) => {
                const response = parseDmvicResponse({
                    responseBody: sampleDMVICFailedResponse,
                    statusCode: DMVIC_STATUS_CODES.FAILED,
                });

                expect(mockOmitEmptyValues).toHaveBeenCalledWith({
                    apiRequestNumber: sampleDMVICFailedResponse.APIRequestNumber,
                    dmvicRefNumber: sampleDMVICFailedResponse.DMVICRefNo,
                    success: false,
                    ntsaResponse: sampleDMVICFailedResponse.callbackObj?.NTSAResponse,
                    issuanceRequestId: sampleDMVICFailedResponse.callbackObj?.IssuanceRequestID,
                    issuanceMessage: sampleDMVICFailedResponse.callbackObj?.IssuanceMessage,
                    error: sampleDMVICFailedResponse.Error.map((errorObj) => ({
                        errorCode: errorObj.errorCode,
                        errorText: errorObj.errorText,
                        sdkErrorCode: errorCode,
                    })),
                });
                expect(response).toHaveProperty('httpStatusCode');
                expect(response.httpStatusCode).toBe(DMVIC_STATUS_CODES.FAILED);

                expect(response).toHaveProperty('error');
                expect(response.error).toBeInstanceOf(Array);
                expect(response.error).toHaveLength(sampleDMVICFailedResponse.Error.length);

                if (sampleDMVICFailedResponse.APIRequestNumber) {
                    expect(response).toHaveProperty('apiRequestNumber');
                } else {
                    expect(response).not.toHaveProperty('apiRequestNumber');
                }

                if (sampleDMVICFailedResponse.DMVICRefNo) {
                    expect(response).toHaveProperty('dmvicRefNumber');
                } else {
                    expect(response).not.toHaveProperty('dmvicRefNumber');
                }
                expect(response).not.toHaveProperty('requestData');

                if (sampleDMVICFailedResponse.callbackObj?.NTSAResponse) {
                    expect(response).toHaveProperty('ntsaResponse');
                } else {
                    expect(response).not.toHaveProperty('ntsaResponse');
                }

                if (sampleDMVICFailedResponse.callbackObj?.IssuanceRequestID) {
                    expect(response).toHaveProperty('issuanceRequestId');
                } else {
                    expect(response).not.toHaveProperty('issuanceRequestId');
                }

                if (sampleDMVICFailedResponse.callbackObj?.IssuanceMessage) {
                    expect(response).toHaveProperty('issuanceMessage');
                } else {
                    expect(response).not.toHaveProperty('issuanceMessage');
                }
            }
        );
    });
});
