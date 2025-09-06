import { jest } from '@jest/globals';
import { generateTestCredentials } from '../factories/test-credential-generator.mjs';

const testCredentials = generateTestCredentials();

const mockInMemoryCache = {
    data: {},
    has: jest.fn((key) => key in mockInMemoryCache.data),
    get: jest.fn((key) => mockInMemoryCache.data[key]),
    set: jest.fn((key, value) => {
        mockInMemoryCache.data[key] = value;
    }),
    clear: jest.fn(() => {
        mockInMemoryCache.data = {};
    }),
};

jest.unstable_mockModule('../../lib/utils/cache.mjs', () => ({
    inMemoryCache: mockInMemoryCache,
}));

const mockValidateCertConfig = jest.fn((config) => config);
const mockValidateFilePaths = jest.fn();
const mockValidateCertContents = jest.fn();

jest.unstable_mockModule('../../lib/utils/validation/certificates-validator.mjs', () => ({
    validateCertConfig: mockValidateCertConfig,
    validateFilePaths: mockValidateFilePaths,
    validateCertContents: mockValidateCertContents,
}));

const mockReadFileSync = jest.fn().mockReturnValue('mocked-cert-content');
jest.unstable_mockModule('fs', () => ({
    readFileSync: mockReadFileSync,
    constants: { R_OK: 4 },
    accessSync: jest.fn(),
    existsSync: jest.fn().mockReturnValue(true),
}));

const mockValidateSecretsConfig = jest.fn();
jest.unstable_mockModule('../../lib/utils/validation/secrets-validator.mjs', () => ({
    validateSecretsConfig: mockValidateSecretsConfig,
}));

let initialize;

beforeAll(async () => {
    const initializeModule = await import('../../lib/api/initialize.mjs');
    initialize = initializeModule.initialize;
});

describe('initialize DMVIC Configurations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInMemoryCache.data = {};
        mockInMemoryCache.has.mockImplementation((key) => key in mockInMemoryCache.data);
        mockInMemoryCache.get.mockImplementation((key) => mockInMemoryCache.data[key]);
        mockValidateSecretsConfig.mockClear();
        mockValidateCertConfig.mockClear().mockImplementation((config) => config);
        mockValidateFilePaths.mockClear();
        mockValidateCertContents.mockClear();
        mockReadFileSync.mockClear().mockReturnValue('mocked-cert-content');
    });

    it('should throw an error for invalid initialization configurations', async () => {
        await expect(initialize()).rejects.toThrow('Invalid configuration. Expected an object.');
        await expect(initialize(null)).rejects.toThrow(
            'Invalid configuration. Expected an object.'
        );
        await expect(initialize(undefined)).rejects.toThrow(
            'Invalid configuration. Expected an object.'
        );
        await expect(initialize('invalid')).rejects.toThrow(
            'Invalid configuration. Expected an object.'
        );
        await expect(initialize({})).rejects.toThrow(
            'Configuration must include "secrets" and "certificates".'
        );
    });

    it('should throw an error for missing secrets configurations', async () => {
        mockValidateSecretsConfig.mockImplementation(() => {
            throw new Error(
                'Configuration errors: Missing one or more required keys: username, password, clientid, environment. Expected keys are: username, password, clientid, environment.'
            );
        });

        await expect(
            initialize({
                secrets: {},
                certificates: {
                    sslKey: '/path/to/test/sslKey.pem',
                    sslCert: '/path/to/test/sslCert.pem',
                },
            })
        ).rejects.toThrow(
            'Configuration errors: Missing one or more required keys: username, password, clientid, environment. Expected keys are: username, password, clientid, environment.'
        );
    });

    it('should throw an error for missing certificate configurations', async () => {
        mockValidateSecretsConfig.mockImplementation(() => {});

        mockValidateCertConfig.mockImplementationOnce(() => {
            throw new Error('Configuration errors: sslKey is required; sslCert is required');
        });

        mockInMemoryCache.data.environment = 'sandbox';

        await expect(
            initialize({
                secrets: {
                    username: testCredentials.username,
                    password: testCredentials.password,
                    clientid: testCredentials.clientid,
                    environment: testCredentials.environment,
                },
                certificates: {},
            })
        ).rejects.toThrow('Configuration errors: sslKey is required; sslCert is required');

        mockValidateCertConfig.mockImplementationOnce(() => {
            throw new Error('Configuration errors: sslCert is required');
        });

        await expect(
            initialize({
                secrets: {
                    username: testCredentials.username,
                    password: testCredentials.password,
                    clientid: testCredentials.clientid,
                    environment: testCredentials.environment,
                },
                certificates: {
                    sslKey: '/path/to/test/sslKey.pem',
                },
            })
        ).rejects.toThrow('Configuration errors: sslCert is required');
    });

    it('should persist valid configuration', async () => {
        mockValidateSecretsConfig.mockImplementation(() => {});
        mockValidateCertConfig.mockImplementation((config) => config);
        mockValidateFilePaths.mockImplementation(() => {});
        mockValidateCertContents.mockImplementation(() => {});

        await expect(
            initialize({
                secrets: {
                    username: testCredentials.username,
                    password: testCredentials.password,
                    clientid: testCredentials.clientid,
                    environment: testCredentials.environment,
                },
                certificates: {
                    sslKey: '/path/to/test/sslKey.pem',
                    sslCert: '/path/to/test/sslCert.pem',
                },
            })
        ).resolves.toBeUndefined();

        expect(mockInMemoryCache.set).toHaveBeenCalledWith('username', testCredentials.username);
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('password', testCredentials.password);
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('clientid', testCredentials.clientid);
        expect(mockInMemoryCache.set).toHaveBeenCalledWith(
            'environment',
            testCredentials.environment
        );

        expect(mockInMemoryCache.set).toHaveBeenCalledWith('sslKey', 'mocked-cert-content');
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('sslCert', 'mocked-cert-content');
    });
});
