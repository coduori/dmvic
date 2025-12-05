import { jest } from '@jest/globals';

import { CANCELLATION_REASONS } from '../../lib/utils/cancellation-reasons.mjs';
import { MOTOR_CLASS_OPTIONS } from '../../lib/utils/constants.mjs';
import { cryptoPickOne } from '../random-pick.mjs';
import { generateTestCredentials } from '../factories/test-credential-generator.mjs';

const testCredentials = generateTestCredentials();

const mockGetApiBaseUrl = jest.fn();
jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => ({
    getApiBaseUrl: mockGetApiBaseUrl,
}));

const mockSendHttpRequest = jest.fn();
jest.unstable_mockModule('../../lib/utils/request-handler.mjs', () => ({
    sendHttpRequest: mockSendHttpRequest,
}));

jest.mock('../../lib/api/confirm-cover-issuance', () => ({
    confirmCoverIssuance: jest.fn().mockResolvedValue({ mocked: 'confirmation' }),
}));

const { makeUnauthenticatedRequest, makeAuthenticatedRequest, validateSupportedValues } =
    await import('../../lib/utils/api-helpers.mjs');

describe('api-helpers tests', () => {
    describe('validateSupportedValues()', () => {
        it.each([
            ['cancellation reasons', Object.keys(CANCELLATION_REASONS)],
            ['motor class', Object.values(MOTOR_CLASS_OPTIONS)],
        ])('should accept valid values for allowedValues: %s', (description, supportedValues) => {
            supportedValues.forEach((validValue) => {
                expect(() =>
                    validateSupportedValues(validValue, supportedValues, description)
                ).not.toThrow();
            });
        });

        it('should throw when allowedValues is not an array', () => {
            const value = cryptoPickOne(Object.keys(CANCELLATION_REASONS));
            expect(() =>
                validateSupportedValues(value, 'not-an-array', 'cancellationReason')
            ).toThrow(/argument must be an array./);
        });

        it('should throw when allowedValues is an empty array', () => {
            const value = cryptoPickOne(Object.keys(CANCELLATION_REASONS));

            expect(() => validateSupportedValues(value, [], 'cancellationReason')).toThrow(
                /array cannot be empty/
            );
        });

        it('should throw when value is not in the allowedValues', () => {
            expect(() =>
                validateSupportedValues(
                    'invalid',
                    Object.keys(CANCELLATION_REASONS),
                    'cancellationReason'
                )
            ).toThrow(/Must be one of:/);
        });
    });

    describe('makeAuthenticatedRequest()', () => {
        it.each([
            ['number', 12],
            ['array', []],
            ['object', {}],
            ['null', null],
            ['undefined', undefined],
            ['empty string', ''],
            ['empty whitespace', '  '],
            ['string with whitespace', 'invalid string'],
            ['string with tab', '\tinvalidstringwithtabprefix'],
            ['string with newline character', '\ninvalidstringwithnewlineprefix'],
            ['string with whitespace prefix', ' invalidstring'],
            ['string with whitespace sufix', 'invalidstring '],
        ])(
            'should throw if an invalid authToken is provided: %s - %s',
            async (description, invalidAuthToken) => {
                await expect(
                    makeAuthenticatedRequest('/test', {}, invalidAuthToken)
                ).rejects.toThrow();
            }
        );

        it.each(['valid-token-string', 'valid.auth.token'])(
            'should successfully call sendHttpRequest() with %s',
            async (validAuthToken) => {
                const testEndpoint = '/ping';
                const testBody = { test: true };
                const apiBase = 'https://test.dmvic.com';

                mockSendHttpRequest.mockResolvedValueOnce({ status: 200, ok: true });
                mockGetApiBaseUrl.mockImplementationOnce(() => apiBase);
                const response = await makeAuthenticatedRequest(
                    testEndpoint,
                    testBody,
                    validAuthToken
                );

                expect(mockGetApiBaseUrl).toHaveBeenCalledTimes(1);
                expect(mockSendHttpRequest).toHaveBeenCalledWith(
                    'POST',
                    `${apiBase}${testEndpoint}`,
                    testBody,
                    validAuthToken,
                    true
                );
                expect(response).toEqual({ status: 200, ok: true });
            }
        );

        it('should throw if sendHttpRequest() throws', async () => {
            const testEndpoint = '/ping';
            const testBody = { test: true };
            const apiBase = 'https://test.dmvic.com';
            const authToken = testCredentials.password;

            mockSendHttpRequest.mockRejectedValueOnce(new Error('network error!'));
            mockGetApiBaseUrl.mockImplementationOnce(() => apiBase);

            await expect(
                makeAuthenticatedRequest(testEndpoint, testBody, authToken)
            ).rejects.toThrow(/network error/);

            expect(mockGetApiBaseUrl).toHaveBeenCalledTimes(1);
            expect(mockSendHttpRequest).toHaveBeenCalledWith(
                'POST',
                `${apiBase}${testEndpoint}`,
                testBody,
                authToken,
                true
            );
        });
    });

    describe('makeUnauthenticatedRequest()', () => {
        it('should throw if sendHttpRequest() throws', async () => {
            const testEndpoint = '/ping';
            const testBody = { test: true };
            const apiBase = 'https://test.dmvic.com';
            mockSendHttpRequest.mockRejectedValueOnce(new Error('network error!'));
            mockGetApiBaseUrl.mockImplementationOnce(() => apiBase);

            await expect(makeUnauthenticatedRequest(testEndpoint, testBody)).rejects.toThrow(
                /network error/
            );

            expect(mockGetApiBaseUrl).toHaveBeenCalledTimes(1);
            expect(mockSendHttpRequest).toHaveBeenCalledWith(
                'POST',
                `${apiBase}${testEndpoint}`,
                testBody,
                null,
                false
            );
        });

        it('should call sendHttpRequest without auth', async () => {
            const testEndpoint = '/ping';
            const testBody = { test: true };
            const apiBase = 'https://test.dmvic.com';

            mockSendHttpRequest.mockResolvedValueOnce({ status: 200, ok: true });
            mockGetApiBaseUrl.mockImplementationOnce(() => apiBase);
            const response = await makeUnauthenticatedRequest(testEndpoint, testBody);

            expect(mockGetApiBaseUrl).toHaveBeenCalledTimes(1);
            expect(mockSendHttpRequest).toHaveBeenCalledWith(
                'POST',
                `${apiBase}${testEndpoint}`,
                testBody,
                null,
                false
            );
            expect(response).toEqual({ status: 200, ok: true });
        });
    });
});
