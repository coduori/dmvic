import { jest } from '@jest/globals';

import { apiConfig } from '../../lib/config/api-configs.mjs';
import { generateTestCredentials } from '../factories/test-credential-generator.mjs';

const testCredentials = generateTestCredentials();

const mockGetSecret = jest.fn();
jest.unstable_mockModule('../../lib/utils/secrets-handler.mjs', () => ({
    getSecret: mockGetSecret,
}));

const mockMakeUnauthenticatedRequest = jest.fn();
jest.unstable_mockModule('../../lib/utils/api-helpers.mjs', () => ({
    makeUnauthenticatedRequest: mockMakeUnauthenticatedRequest,
}));

const { authenticate } = await import('../../lib/api/authenticate.mjs');

describe('authenticate', () => {
    beforeAll(() => {
        mockGetSecret.mockImplementation((key) => {
            const configs = {
                username: testCredentials.username,
                password: testCredentials.password,
            };
            return configs[key];
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should call makeUnauthenticatedRequest', async () => {
        const resolvedResponse = { responseBody: { token: 'auth.token', success: true } };
        mockMakeUnauthenticatedRequest.mockResolvedValueOnce(resolvedResponse);

        const response = await authenticate();

        expect(mockGetSecret).toHaveBeenCalledTimes(2);
        expect(mockMakeUnauthenticatedRequest).toHaveBeenCalledTimes(1);
        expect(mockMakeUnauthenticatedRequest).toHaveBeenCalledWith(apiConfig.general.login, {
            username: testCredentials.username,
            password: testCredentials.password,
        });
        expect(response).toBe(resolvedResponse);
    });

    it('should throw if makeUnauthenticatedRequest throws', async () => {
        const errorMessage = new Error('an error occurred!');

        mockMakeUnauthenticatedRequest.mockRejectedValueOnce(errorMessage);

        await expect(authenticate()).rejects.toThrow(/an error occurred!/);
    });
});
