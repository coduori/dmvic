import { jest } from '@jest/globals';
import {
    authError401,
    invalidTokenErrorResponse,
    notFoundErrorResponse,
    successfulAuthresponse,
} from '../../fixtures/sample-sdk-response.mjs';

const mockAuthenticate = jest.fn();

jest.unstable_mockModule('../../../lib/index.mjs', () => ({
    authenticate: mockAuthenticate,
}));

const { reauthenticateAndRetryAfterware } = await import(
    '../../../lib/utils/afterwares/reauthenticate-and-retry.mjs'
);

describe('reauthentication afterware', () => {
    it.each([
        ['INVLD_TKN', invalidTokenErrorResponse],
        ['401 status code', authError401],
    ])('should reauthenticate if the response is: %s', async (description, errorResponse) => {
        const retryRequest = jest.fn();
        mockAuthenticate.mockResolvedValueOnce({
            success: true,
            responseData: { token: 'new-token' },
        });
        const response = await reauthenticateAndRetryAfterware(errorResponse, {
            retryCount: 0,
            retryRequest,
        });

        expect(response).toHaveProperty('tokenRefreshed');
        expect(response.tokenRefreshed).toBe(true);
        expect(response).toHaveProperty('newToken');
        expect(typeof response.newToken).toBe('string');
        expect(retryRequest).toHaveBeenCalledTimes(1);
        expect(mockAuthenticate).toHaveBeenCalledTimes(1);
    });

    it('should not reauthenticate if response is a successful auth response', async () => {
        const retryRequest = jest.fn();

        const response = await reauthenticateAndRetryAfterware(successfulAuthresponse, {
            retryCount: 0,
            retryRequest,
        });
        expect(response).toHaveProperty('tokenRefreshed');
        expect(response.tokenRefreshed).toBe(false);
        expect(response).not.toHaveProperty('newToken');
        expect(retryRequest).toHaveBeenCalledTimes(0);
        expect(mockAuthenticate).toHaveBeenCalledTimes(0);
    });
    it('should not reauthenticate if retry count is greater than 1', async () => {
        const retryRequest = jest.fn();
        mockAuthenticate.mockResolvedValueOnce({
            success: true,
            responseData: { token: 'new-token' },
        });
        const response = await reauthenticateAndRetryAfterware(invalidTokenErrorResponse, {
            retryCount: 1,
            retryRequest,
        });

        expect(response).toHaveProperty('tokenRefreshed');
        expect(response.tokenRefreshed).toBe(false);
        expect(response).not.toHaveProperty('newToken');
        expect(retryRequest).toHaveBeenCalledTimes(0);
        expect(mockAuthenticate).toHaveBeenCalledTimes(0);
    });
    it('should not reauthenticate for error codes other than INVLD_TKN', async () => {
        const retryRequest = jest.fn();
        mockAuthenticate.mockResolvedValueOnce({
            success: true,
            responseData: { token: 'new-token' },
        });
        const response = await reauthenticateAndRetryAfterware(notFoundErrorResponse, {
            retryCount: 0,
            retryRequest,
        });

        expect(response).toHaveProperty('tokenRefreshed');
        expect(response.tokenRefreshed).toBe(false);
        expect(response).not.toHaveProperty('newToken');
        expect(retryRequest).toHaveBeenCalledTimes(0);
        expect(mockAuthenticate).toHaveBeenCalledTimes(0);
    });
});
