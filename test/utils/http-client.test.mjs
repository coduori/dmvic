import { jest } from '@jest/globals';

const mockClientInstance = {};
const mockClientConstructor = jest.fn(() => mockClientInstance);
// eslint-disable-next-line no-unused-vars
const mockReadFileSync = jest.fn((path, _encoding) => `mocked-${path}`);

jest.unstable_mockModule('undici', () => ({
    Client: mockClientConstructor,
}));
jest.unstable_mockModule('fs', () => ({
    readFileSync: mockReadFileSync,
}));
const mockGetAPIBaseURL = jest.fn(() => 'https://mocked-api');
jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => ({
    getAPIBaseURL: mockGetAPIBaseURL,
}));

let { getClient } = await import('../../lib/utils/http-client.mjs');

describe('Get HTTP Client', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        jest.resetModules();
        ({ getClient } = await import('../../lib/utils/http-client.mjs'));
    });

    it('creates a new Client with correct options on first call', () => {
        process.env.dmvic_sslKey = '/path/to/key';
        process.env.dmvic_sslCert = '/path/to/cert';

        const client = getClient();

        expect(mockGetAPIBaseURL).toHaveBeenCalled();
        expect(mockReadFileSync).toHaveBeenCalledWith('/path/to/key', 'utf8');
        expect(mockReadFileSync).toHaveBeenCalledWith('/path/to/cert', 'utf8');
        expect(mockClientConstructor).toHaveBeenCalledWith('https://mocked-api', {
            connect: {
                key: 'mocked-/path/to/key',
                cert: 'mocked-/path/to/cert',
                requestCert: true,
                rejectUnauthorized: false,
            },
        });
        expect(client).toBe(mockClientInstance);
    });

    it('returns the same client instance on subsequent calls', () => {
        process.env.dmvic_sslKey = '/path/to/key';
        process.env.dmvic_sslCert = '/path/to/cert';

        const client1 = getClient();
        const client2 = getClient();

        expect(client1).toBe(client2);
        expect(mockClientConstructor).toHaveBeenCalledTimes(1);
    });
});
