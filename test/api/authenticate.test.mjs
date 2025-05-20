import { expect, jest } from '@jest/globals';

import {
    mockApiConfig,
    mockInvoke,
    mockRequestHandler,
    mockSecretsManager,
} from '../mocks/mocks.mjs';

jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => mockApiConfig);
jest.unstable_mockModule('../../lib/utils/request-handler.mjs', () => mockRequestHandler);
jest.unstable_mockModule('../../lib/utils/secrets-manager.mjs', () => mockSecretsManager);

const { authenticate } = await import('../../lib/api/authenticate.mjs');
const { getAPIBaseURL } = await import('../../lib/config/api-configs.mjs');
const { getSecret } = await import('../../lib/utils/secrets-manager.mjs');

describe('authenticate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        jest.clearAllMocks();
        mockInvoke.mockResolvedValue({
            responseBody: { token: 'mocked-token' },
            statusCode: 200,
        });
    });

    it('should call getSecret() to get authentication credentials', async () => {
        await authenticate();
        expect(getSecret).toHaveBeenCalledWith('username');
        expect(getSecret).toHaveBeenCalledWith('password');
        expect(getSecret).toHaveBeenCalledWith('environment');
        expect(getSecret).toHaveBeenCalledTimes(3);
    });

    it('should fetch the correct DMVIC base URL', async () => {
        await authenticate();
        expect(getAPIBaseURL).toHaveBeenCalledWith('test');
        expect(getAPIBaseURL).toHaveReturnedWith('https://test-api.example.com');
        expect(getAPIBaseURL).toHaveBeenCalledTimes(1);
    });

    it('should call invoke with correct arguments', async () => {
        await authenticate();
        expect(mockInvoke).toHaveBeenCalledWith(
            'POST',
            'https://test-api.example.com/api/T1/Account/Login',
            { username: 'testUser', password: 'testPass' },
            null,
            false,
        );
        expect(mockInvoke).toHaveBeenCalledTimes(1);
    });

    it('should return the token from the response', async () => {
        const token = await authenticate();
        expect(token).toBe('mocked-token');
    });

    it('should throw an error if statusCode is not 200', async () => {
        mockInvoke.mockResolvedValueOnce({
            responseBody: { Errror: 'Invalid credentials' },
            statusCode: 401,
        });
        await expect(authenticate()).rejects.toThrow('Authentication failed: Invalid credentials');
    });

    it('should throw an error if invoke throws', async () => {
        mockInvoke.mockRejectedValueOnce(new Error('Network error'));
        await expect(authenticate()).rejects.toThrow('Error fetching data: Network error');
    });
});
