import { jest } from '@jest/globals';
import { mockInMemoryCache } from '../mocks/mocks.mjs';

const mockClientInstance = {};
const mockClientConstructor = jest.fn(() => mockClientInstance);

jest.unstable_mockModule('../../lib/utils/cache.mjs', () => ({
    inMemoryCache: mockInMemoryCache,
}));

jest.unstable_mockModule('undici', () => ({
    Client: mockClientConstructor,
}));

const mockGetAPIBaseURL = jest.fn().mockReturnValue('https://test-api.com');
jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => ({
    getApiBaseUrl: mockGetAPIBaseURL,
}));

const mockGetSecret = jest.fn((key) => {
    if (key === 'environment') return 'sandbox';
    throw new Error(`Secret "${key}" is not configured.`);
});
jest.unstable_mockModule('../../lib/utils/secrets-handler.mjs', () => ({
    getSecret: mockGetSecret,
}));

const mockGetCertificate = jest.fn((key) => {
    if (key === 'sslKey') return 'dummy-sslKey';
    if (key === 'sslCert') return 'dummy-sslCert';
    throw new Error(`Dev Error::: Unexpected certificate key: ${key}`);
});
jest.unstable_mockModule('../../lib/utils/certificates-handler.mjs', () => ({
    getCertificate: mockGetCertificate,
}));

let getClient;

beforeAll(async () => {
    const httpClient = await import('../../lib/utils/http-client.mjs');
    getClient = httpClient.getClient;
});

describe('HTTP Client Module', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        getClient.reset();
    });

    it('creates a new Client with correct options on first call', () => {
        const client = getClient();

        expect(mockGetSecret).toHaveBeenCalledWith('environment');
        expect(mockGetAPIBaseURL).toHaveBeenCalledWith('sandbox');

        expect(mockGetCertificate).toHaveBeenCalledWith('sslKey');
        expect(mockGetCertificate).toHaveBeenCalledWith('sslCert');

        expect(mockClientConstructor).toHaveBeenCalledWith('https://test-api.com', {
            connect: {
                key: 'dummy-sslKey',
                cert: 'dummy-sslCert',
                requestCert: true,
                rejectUnauthorized: true,
            },
        });
        expect(client).toBe(mockClientInstance);
    });

    it('returns the same client instance on subsequent calls', () => {
        const client1 = getClient();
        const client2 = getClient();

        expect(client1).toBe(client2);
        expect(mockClientConstructor).toHaveBeenCalledTimes(1);
    });

    it('throws error if getSecret fails', () => {
        mockGetSecret.mockImplementationOnce(() => {
            throw new Error('Secret not found');
        });

        expect(() => getClient()).toThrow('Secret not found');
    });

    it('throws error if getCertificate fails', () => {
        mockGetCertificate.mockImplementationOnce((key) => {
            if (key === 'sslKey') throw new Error('SSL key error');
            return 'dummy-sslCert';
        });

        expect(() => getClient()).toThrow('SSL key error');
    });
});
