import { jest } from '@jest/globals';
import { mockInMemoryCache } from '../mocks/mocks.mjs';

jest.unstable_mockModule('../../lib/utils/cache.mjs', () => ({
    inMemoryCache: mockInMemoryCache,
}));

let configureSecrets, getSecret;

beforeAll(async () => {
    const secretsManager = await import('../../lib/utils/secrets-manager.mjs');
    configureSecrets = secretsManager.configureSecrets;
    getSecret = secretsManager.getSecret;
});

describe('Configure DMVIC Secrets', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInMemoryCache.has.mockClear();
        mockInMemoryCache.get.mockClear();
        mockInMemoryCache.set.mockClear();
        mockInMemoryCache.clear.mockClear();
    });

    it('should throw an error for missing secrets configurations', () => {
        expect(() => configureSecrets({})).toThrow(
            'Configuration errors: Missing one or more required keys: username, password, clientid, environment. Expected keys are: username, password, clientid, environment.'
        );
        expect(() => configureSecrets({ username: 'test-user-name' })).toThrow(
            'Configuration errors: Missing one or more required keys: password, clientid, environment. Expected keys are: username, password, clientid, environment.'
        );
        expect(() =>
            configureSecrets({
                username: 'test-user-name',
                password: 'test-password',
            })
        ).toThrow(
            'Configuration errors: Missing one or more required keys: clientid, environment. Expected keys are: username, password, clientid, environment.'
        );
        expect(() =>
            configureSecrets({
                username: 'test-user-name',
                password: 'test-password',
                clientid: 'test-clientId',
            })
        ).toThrow(
            'Configuration errors: Missing one or more required keys: environment. Expected keys are: username, password, clientid, environment.'
        );
    });

    it('should persist valid secrets configuration', () => {
        expect(() =>
            configureSecrets({
                username: 'test-user-name',
                password: 'test-password',
                clientid: 'test-clientId',
                environment: 'test-environment',
            })
        ).not.toThrow();
    });
});

describe('Get Configured Secrets', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInMemoryCache.has.mockClear();
        mockInMemoryCache.get.mockClear();
        mockInMemoryCache.set.mockClear();
        mockInMemoryCache.clear.mockClear();
    });

    it('should throw an error if username secret configuration is not set', () => {
        expect(() => getSecret('username')).toThrow('Secret "username" is not configured.');
    });

    it('should return a configured value without throwing an error', () => {
        const configUsername = 'secret_username';
        mockInMemoryCache.has.mockReturnValue(true);
        mockInMemoryCache.get.mockReturnValueOnce(configUsername);

        const result = getSecret('username');
        expect(result).toBe(configUsername);

        expect(mockInMemoryCache.has).toHaveBeenCalledWith('username');
        expect(mockInMemoryCache.get).toHaveBeenCalledWith('username');
    });

    it('should throw an error when the key is not in the cache', () => {
        mockInMemoryCache.has.mockReturnValue(false);

        expect(() => getSecret('username')).toThrow('Secret "username" is not configured.');
        expect(mockInMemoryCache.has).toHaveBeenCalledWith('username');
    });
});
