import { jest } from '@jest/globals';
// Mock the cache first
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

// Mock validation functions
const mockValidateCertConfig = jest.fn((config) => config);
const mockValidateFilePaths = jest.fn();
const mockValidateCertContents = jest.fn();

jest.unstable_mockModule('../../lib/utils/validation/certificates-validator.mjs', () => ({
    validateCertConfig: mockValidateCertConfig,
    validateFilePaths: mockValidateFilePaths,
    validateCertContents: mockValidateCertContents,
}));

// Mock FS operations
const mockReadFileSync = jest.fn().mockReturnValue('mocked-cert-content');
jest.unstable_mockModule('fs', () => ({
    readFileSync: mockReadFileSync,
    constants: { R_OK: 4 },
    accessSync: jest.fn(),
    existsSync: jest.fn().mockReturnValue(true),
}));

// Mock secrets validator
const mockValidateSecretsConfig = jest.fn();
jest.unstable_mockModule('../../lib/utils/validation/secrets-validator.mjs', () => ({
    validateSecretsConfig: mockValidateSecretsConfig,
}));

// Import the module under test after all mocks are set up
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
        mockValidateSecretsConfig.mockImplementation(() => {}); // Don't throw for secrets

        // First case: both sslKey and sslCert are missing
        mockValidateCertConfig.mockImplementationOnce(() => {
            throw new Error('Configuration errors: sslKey is required; sslCert is required');
        });

        // Set environment in the mock cache first to avoid "environment not configured" error
        mockInMemoryCache.data.environment = 'sandbox';

        await expect(
            initialize({
                secrets: {
                    username: 'test-user-name',
                    password: 'test-password',
                    clientid: 'test-clientId',
                    environment: 'sandbox',
                },
                certificates: {},
            })
        ).rejects.toThrow('Configuration errors: sslKey is required; sslCert is required');

        // Second case: sslCert is missing
        mockValidateCertConfig.mockImplementationOnce(() => {
            throw new Error('Configuration errors: sslCert is required');
        });

        await expect(
            initialize({
                secrets: {
                    username: 'test-user-name',
                    password: 'test-password',
                    clientid: 'test-clientId',
                    environment: 'sandbox',
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
                    username: 'test-user-name',
                    password: 'test-password',
                    clientid: 'test-clientId',
                    environment: 'sandbox',
                },
                certificates: {
                    sslKey: '/path/to/test/sslKey.pem',
                    sslCert: '/path/to/test/sslCert.pem',
                },
            })
        ).resolves.toBeUndefined();

        // Check if the secrets were set in the cache
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('username', 'test-user-name');
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('password', 'test-password');
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('clientid', 'test-clientId');
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('environment', 'sandbox');

        // Check if certificates content was also set
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('sslKey', 'mocked-cert-content');
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('sslCert', 'mocked-cert-content');
    });
});
