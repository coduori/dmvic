import { jest } from '@jest/globals';

// Mocks for crypto module with various implementations
const sandboxCryptoMock = {
    X509Certificate: jest.fn().mockImplementation(() => ({
        subject: 'CN=uat-api.dmvic.com',
        checkPrivateKey: jest.fn().mockReturnValue(true),
    })),
    createPrivateKey: jest.fn().mockReturnValue({}),
};

const productionCryptoMock = {
    X509Certificate: jest.fn().mockImplementation(() => ({
        subject: 'CN=api.dmvic.com',
        checkPrivateKey: jest.fn().mockReturnValue(true),
    })),
    createPrivateKey: jest.fn().mockReturnValue({}),
};

const wrongSubjectCryptoMock = {
    X509Certificate: jest.fn().mockImplementation(() => ({
        subject: 'CN=wrong-api.dmvic.com',
        checkPrivateKey: jest.fn().mockReturnValue(true),
    })),
    createPrivateKey: jest.fn().mockReturnValue({}),
};

const keyMismatchCryptoMock = {
    X509Certificate: jest.fn().mockImplementation(() => ({
        subject: 'CN=uat-api.dmvic.com',
        checkPrivateKey: jest.fn().mockReturnValue(false),
    })),
    createPrivateKey: jest.fn().mockReturnValue({}),
};

const invalidCertCryptoMock = {
    X509Certificate: jest.fn().mockImplementation(() => {
        throw new Error('Invalid certificate format');
    }),
    createPrivateKey: jest.fn().mockReturnValue({}),
};

// Default mock for file system operations
const mockFsAccessSync = jest.fn();
jest.unstable_mockModule('fs', () => ({
    accessSync: mockFsAccessSync,
    constants: {
        R_OK: 4,
    },
    existsSync: jest.fn().mockReturnValue(true),
}));

// Import validateCertConfig for non-crypto dependent tests
jest.unstable_mockModule('crypto', () => sandboxCryptoMock);
import { validateCertConfig } from '../../../lib/utils/validation/certificates-validator.mjs';

// Helper function to make tests more DRY by reusing mock setup and module imports
async function testCertValidation(cryptoMock, testFn) {
    jest.resetModules();
    jest.unstable_mockModule('crypto', () => cryptoMock);
    const { validateCertContents } = await import(
        '../../../lib/utils/validation/certificates-validator.mjs'
    );
    testFn(validateCertContents);
}

describe('validateCertConfig', () => {
    test('should not throw error for a valid certificate configuration', () => {
        const validConfig = { sslKey: '/path/to/sslKey', sslCert: '/path/to/sslCert' };
        expect(() => validateCertConfig(validConfig)).not.toThrow();
    });

    test('should throw an error if sslKey is missing', () => {
        const configMissingSslKey = { sslCert: '/path/to/sslCert' };
        expect(() => validateCertConfig(configMissingSslKey)).toThrow(
            'Configuration errors: sslKey is required'
        );
    });

    test('should throw an error if sslCert is missing', () => {
        const configMissingSslCert = { sslKey: '/path/to/sslKey' };
        expect(() => validateCertConfig(configMissingSslCert)).toThrow(
            'Configuration errors: sslCert is required'
        );
    });

    test('should throw a combined error if both sslKey and sslCert are missing', () => {
        expect(() => validateCertConfig({})).toThrow(
            'Configuration errors: sslKey is required; sslCert is required'
        );
    });
});

describe('Additional edge cases for validateCertConfig', () => {
    test('should throw an error if configuration is null', () => {
        expect(() => validateCertConfig(null)).toThrow(
            'Invalid certificate configuration. Expected a plain object.'
        );
    });

    test('should throw an error if configuration is not an object', () => {
        expect(() => validateCertConfig('invalid')).toThrow(
            'Invalid certificate configuration. Expected a plain object.'
        );
    });
});

describe('Edge cases for certificate config values', () => {
    test('should throw an error if sslKey is an empty string', () => {
        expect(() => validateCertConfig({ sslKey: '', sslCert: '/path/to/sslCert' })).toThrow(
            'Configuration errors: sslKey is required'
        );
    });

    test('should throw an error if sslCert is an empty string', () => {
        expect(() => validateCertConfig({ sslKey: '/path/to/sslKey', sslCert: '' })).toThrow(
            'Configuration errors: sslCert is required'
        );
    });

    test('should throw a combined error if both sslKey and sslCert are empty', () => {
        expect(() => validateCertConfig({ sslKey: '', sslCert: '' })).toThrow(
            'Configuration errors: sslKey is required; sslCert is required'
        );
    });

    test('should throw an error if extra keys are provided along with valid keys', () => {
        const config = { sslKey: '/path/to/sslKey', sslCert: '/path/to/sslCert', extra: 'ignored' };
        expect(() => validateCertConfig(config)).toThrow(
            'Configuration errors: Invalid certificate configuration. Unexpected key(s): extra'
        );
    });
});

describe('getExpectedSubject (tested through validateCertContents)', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    // We'll test this internal function through validateCertContents
    test('should correctly validate sandbox environment subject', async () => {
        await testCertValidation(sandboxCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents({ sslCert: 'dummy content', sslKey: 'dummy key' }, 'sandbox');
            }).not.toThrow();
        });
    });

    test('should correctly validate production environment subject', async () => {
        await testCertValidation(productionCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents(
                    { sslCert: 'dummy content', sslKey: 'dummy key' },
                    'production'
                );
            }).not.toThrow();
        });
    });

    test('should throw error for unknown environment', async () => {
        await testCertValidation(sandboxCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents(
                    { sslCert: 'dummy content', sslKey: 'dummy key' },
                    'development'
                );
            }).toThrow(
                'Invalid certificate or key content: No expected certificate subject defined for environment: "development"'
            );
        });
    });
});

describe('validateCertContents', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    test('should validate certificate with matching subject for sandbox', async () => {
        await testCertValidation(sandboxCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents({ sslCert: 'dummy content', sslKey: 'dummy key' }, 'sandbox');
            }).not.toThrow();
        });
    });

    test('should validate certificate with matching subject for production', async () => {
        await testCertValidation(productionCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents(
                    { sslCert: 'dummy content', sslKey: 'dummy key' },
                    'production'
                );
            }).not.toThrow();
        });
    });

    test('should throw when certificate subject does not match expected', async () => {
        await testCertValidation(wrongSubjectCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents(
                    { sslCert: 'dummy content', sslKey: 'dummy key' },
                    'production'
                );
            }).toThrow(
                'Invalid certificate or key content: Certificate subject "CN=wrong-api.dmvic.com" does not match the expected subject for environment "production": "CN=api.dmvic.com".'
            );
        });
    });

    test('should throw when private key does not match certificate', async () => {
        await testCertValidation(keyMismatchCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents({ sslCert: 'dummy content', sslKey: 'dummy key' }, 'sandbox');
            }).toThrow(
                "Invalid certificate or key content: Private key does not match the certificate's public key."
            );
        });
    });

    test('should throw when certificate instantiation fails', async () => {
        await testCertValidation(invalidCertCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents(
                    { sslCert: 'invalid content', sslKey: 'dummy key' },
                    'sandbox'
                );
            }).toThrow('Invalid certificate or key content: Invalid certificate format');
        });
    });

    test('should throw with unknown environment', async () => {
        await testCertValidation(sandboxCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents(
                    { sslCert: 'dummy content', sslKey: 'dummy key' },
                    'development'
                );
            }).toThrow(
                'Invalid certificate or key content: No expected certificate subject defined for environment: "development"'
            );
        });
    });
});
