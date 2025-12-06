import { jest } from '@jest/globals';

import { apiConfig } from '../../lib/config/api-configs.mjs';
import { generateTestCredentials } from '../factories/test-credential-generator.mjs';

const testCredentials = generateTestCredentials();
const mockMakeAuthenticatedRequest = jest.fn();
const mockGetSecret = jest.fn();

jest.unstable_mockModule('../../lib/utils/api-helpers.mjs', () => ({
    makeAuthenticatedRequest: mockMakeAuthenticatedRequest,
}));

jest.unstable_mockModule('../../lib/utils/secrets-handler.mjs', () => ({
    getSecret: mockGetSecret,
}));

const { confirmCoverIssuance } = await import('../../lib/api/confirm-cover-issuance.mjs');

describe('confirm cover issuance', () => {
    it('should call makeAuthenticatedRequest', async () => {
        const authToken = 'auth.token';
        const issuanceRequestId = 'UAT-AAB8761';

        mockGetSecret.mockImplementationOnce(() => testCredentials.username);

        expect(() => confirmCoverIssuance(authToken, issuanceRequestId)).not.toThrow();
        expect(mockGetSecret).toHaveBeenCalledTimes(1);
        expect(mockMakeAuthenticatedRequest).toHaveBeenCalledTimes(1);
        expect(mockMakeAuthenticatedRequest).toHaveBeenCalledWith({
            endpoint: apiConfig.general.confirmIssuance,
            requestPayload: {
                IssuanceRequestID: issuanceRequestId,
                IsApproved: true,
                IsLogBookVerified: true,
                IsVehicleInspected: true,
                AdditionalComments: '',
                UserName: testCredentials.username,
            },
            authToken,
        });
    });

    it('should throw if makeUnauthenticatedRequest throws', async () => {
        const errorMessage = new Error('an error occurred!');

        mockMakeAuthenticatedRequest.mockRejectedValueOnce(errorMessage);

        await expect(confirmCoverIssuance()).rejects.toThrow(/an error occurred!/);
    });
});
