import { jest } from '@jest/globals';

import { mockInMemoryCache } from '../mocks/mocks.mjs';

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

let configureCertificates, getCertificate;

beforeAll(async () => {
    const certManager = await import('../../lib/utils/cert-manager.mjs');
    configureCertificates = certManager.configureCertificates;
    getCertificate = certManager.getCertificate;
});

describe('Configure DMVIC Certificates', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInMemoryCache.has.mockClear();
        mockInMemoryCache.get.mockClear();
        mockInMemoryCache.set.mockClear();
        mockInMemoryCache.clear.mockClear();
        mockValidateCertConfig.mockClear().mockImplementation((config) => config);
        mockValidateFilePaths.mockClear();
        mockValidateCertContents.mockClear();
        mockReadFileSync.mockClear().mockReturnValue('mocked-cert-content');
    });

    it('should throw an error for missing certificate configurations', () => {
        mockValidateCertConfig.mockImplementationOnce(() => {
            throw new Error('Configuration errors: sslKey is required; sslCert is required');
        });

        expect(() => configureCertificates({})).toThrow(
            'Configuration errors: sslKey is required; sslCert is required'
        );

        mockValidateCertConfig.mockImplementationOnce(() => {
            throw new Error('Configuration errors: sslCert is required');
        });

        expect(() =>
            configureCertificates({
                sslKey: '/path/to/test/sslKey',
            })
        ).toThrow('Configuration errors: sslCert is required');

        mockValidateCertConfig.mockImplementationOnce(() => {
            throw new Error('Configuration errors: sslKey is required');
        });

        expect(() =>
            configureCertificates({
                sslCert: '/path/to/test/sslCert',
            })
        ).toThrow('Configuration errors: sslKey is required');
    });

    it('should throw an error for identical certificate and key paths', () => {
        mockValidateCertConfig.mockImplementationOnce(() => {
            throw new Error('Configuration errors: SSL key and SSL cert paths cannot be identical');
        });

        expect(() =>
            configureCertificates({
                sslKey: '/path/to/test/sslKey',
                sslCert: '/path/to/test/sslKey',
            })
        ).toThrow('Configuration errors: SSL key and SSL cert paths cannot be identical');
    });

    it('should persist valid configuration', () => {
        const validConfig = {
            sslKey: '/path/to/test/sslKey',
            sslCert: '/path/to/test/sslCert',
        };

        expect(() => configureCertificates(validConfig)).not.toThrow();

        expect(mockInMemoryCache.set).toHaveBeenCalledWith('sslKey', 'mocked-cert-content');
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('sslCert', 'mocked-cert-content');
    });
});

describe('Get Configured Certificates', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInMemoryCache.has.mockClear();
        mockInMemoryCache.get.mockClear();
        mockInMemoryCache.set.mockClear();
        mockInMemoryCache.clear.mockClear();
    });

    it('should throw an error if sslKey certificate configuration is not set', () => {
        mockInMemoryCache.has.mockReturnValue(false);
        expect(() => getCertificate('sslKey', mockInMemoryCache)).toThrow(
            'Certificate "sslKey" is not configured or loaded.'
        );
    });

    it('should return sslKey certificate configuration value', () => {
        const configuredSslKey = 'mocked-cert-content';
        mockInMemoryCache.has.mockReturnValue(true);
        mockInMemoryCache.get.mockReturnValue(configuredSslKey);
        expect(getCertificate('sslKey', mockInMemoryCache)).toBe(configuredSslKey);
    });
});

describe('Certificate configuration trimming and persistence', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInMemoryCache.has.mockClear();
        mockInMemoryCache.get.mockClear();
        mockInMemoryCache.set.mockClear();
        mockInMemoryCache.clear.mockClear();
    });

    test('should trim configuration values', () => {
        const configWithSpaces = { sslKey: '   /path/to/sslKey  ', sslCert: ' /path/to/sslCert ' };
        configureCertificates(configWithSpaces, 'sandbox', mockInMemoryCache);
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('sslKey', 'mocked-cert-content');
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('sslCert', 'mocked-cert-content');
    });

    test('should throw error if trimmed values are identical', () => {
        mockValidateCertConfig.mockImplementationOnce(() => {
            throw new Error('Configuration errors: SSL key and SSL cert paths cannot be identical');
        });

        expect(() =>
            configureCertificates({ sslKey: ' /same/path/ ', sslCert: ' /same/path/ ' })
        ).toThrow('Configuration errors: SSL key and SSL cert paths cannot be identical');
    });

    test('should persist valid configuration', () => {
        const validConfig = { sslKey: '/path/to/sslKey', sslCert: '/path/to/sslCert' };
        configureCertificates(validConfig, 'sandbox', mockInMemoryCache);
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('sslKey', 'mocked-cert-content');
        expect(mockInMemoryCache.set).toHaveBeenCalledWith('sslCert', 'mocked-cert-content');
    });
});

describe('Certificate files configuration and retrieval', () => {
    test('should test certificate configuration in test environment', () => {
        expect(() => {
            configureCertificates(
                {
                    sslKey: '/path/to/test/sslKey',
                    sslCert: '/path/to/test/sslCert',
                },
                'sandbox'
            );
        }).not.toThrow();
    });
});
