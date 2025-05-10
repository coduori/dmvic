import { expect, jest } from '@jest/globals';

import {
    mockSetCacheKey,
    mockRedisModule,
    mockHttpClient,
    mockSecretsManager,
    mockApiConfig,
} from '../mocks/mocks.mjs';

jest.unstable_mockModule('../../lib/utils/db/redis.mjs', () => mockRedisModule);
jest.unstable_mockModule('../../lib/utils/httpClient.mjs', () => mockHttpClient);
jest.unstable_mockModule('../../lib/utils/secretsManager.mjs', () => mockSecretsManager);
jest.unstable_mockModule('../../lib/config/apiConfig.mjs', () => mockApiConfig);

const { authenticate } = await import('../../lib/api/authenticate.mjs');
const { getSecret } = await import('../../lib/utils/secretsManager.mjs');
const { getAPIBaseURL } = await import('../../lib/config/apiConfig.mjs');
const { __mockRequest, getClient } = await import('../../lib/utils/httpClient.mjs');
const { setCacheKey } = await import('../../lib/utils/db/redis.mjs');

describe('authenticate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should call getSecret() to get authentication credentials', async () => {
        // when
        await authenticate();

        // then
        expect(getSecret).toHaveBeenCalledWith('username');
        expect(getSecret).toHaveBeenCalledWith('password');
        expect(getSecret).toHaveBeenCalledWith('clientId');
        expect(getSecret).toHaveBeenCalledWith('environment');
        expect(getSecret).toHaveBeenCalledTimes(4);
    });

    it('should fetch the correct DMVIC base URL', async () => {
        // when
        await authenticate();

        // then
        expect(getAPIBaseURL).toHaveBeenCalledWith('test');
        expect(getAPIBaseURL).toHaveReturnedWith('https://test-api.example.com');
        expect(getAPIBaseURL).toHaveBeenCalledTimes(1);
    });

    it('should send an HTTP request to authenticate on DMVIC', async () => {
        // when
        const token = await authenticate();

        // then
        expect(token).toBe('mocked-token');
        expect(getClient).toHaveBeenCalledTimes(1);
        expect(__mockRequest).toHaveBeenCalledWith({
            path: 'https://test-api.example.com/api/V1/Account/Login',
            method: 'POST',
            body: JSON.stringify({
                username: 'testUser',
                password: 'testPass',
            }),
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                clientId: 'testClient',
            },
        });
    });

    it('should set the token in the cache', async () => {
        // when
        await authenticate();

        // then
        expect(setCacheKey).toHaveBeenCalledTimes(1);
        const [actualKey, actualToken, actualOpt] = mockSetCacheKey.mock.calls[0];
        expect(actualKey).toBe('dmvic:auth:token');
        expect(actualToken).toBe('mocked-token');
        expect(actualOpt).toEqual({ EX: 604800 });
    });
});

/*
TODO:
1. Add more test cases to cover different scenarios, such as error handling and edge cases.
*/
