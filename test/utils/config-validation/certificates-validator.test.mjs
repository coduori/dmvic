import { jest } from '@jest/globals';

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

const mockFsAccessSync = jest.fn();
jest.unstable_mockModule('fs', () => ({
    accessSync: mockFsAccessSync,
    constants: {
        R_OK: 4,
    },
    existsSync: jest.fn().mockReturnValue(true),
}));

jest.unstable_mockModule('crypto', () => sandboxCryptoMock);
import { validateCertConfig } from '../../../lib/utils/config-validation/certificates-validator.mjs';

async function testCertValidation(cryptoMock, testFn) {
    jest.resetModules();
    jest.unstable_mockModule('crypto', () => cryptoMock);
    const { validateCertContents } = await import(
        '../../../lib/utils/config-validation/certificates-validator.mjs'
    );
    testFn(validateCertContents);
}

describe('validateCertConfig', () => {
    it('should not throw error for a valid certificate configuration', () => {
        const validConfig = { sslKey: '/path/to/sslKey', sslCert: '/path/to/sslCert' };
        expect(() => validateCertConfig(validConfig)).not.toThrow();
    });

    it('should throw an error if sslKey is missing', () => {
        const configMissingSslKey = { sslCert: '/path/to/sslCert' };
        expect(() => validateCertConfig(configMissingSslKey)).toThrow(
            'Configuration errors: sslKey is required'
        );
    });

    it('should throw an error if sslCert is missing', () => {
        const configMissingSslCert = { sslKey: '/path/to/sslKey' };
        expect(() => validateCertConfig(configMissingSslCert)).toThrow(
            'Configuration errors: sslCert is required'
        );
    });

    it('should throw a combined error if both sslKey and sslCert are missing', () => {
        expect(() => validateCertConfig({})).toThrow(
            'Configuration errors: sslKey is required; sslCert is required'
        );
    });

    it('should throw an error if the ssl key and ssl cert are identical', () => {
        const identicalCertAndKey = { sslKey: '/path/to/sslKey', sslCert: '/path/to/sslKey' };
        expect(() => validateCertConfig(identicalCertAndKey)).toThrow(
            'Configuration errors: SSL key and SSL cert paths cannot be identical'
        );
    });
});

describe('Additional edge cases for validateCertConfig', () => {
    it('should throw an error if configuration is null', () => {
        expect(() => validateCertConfig(null)).toThrow(
            'Invalid certificate configuration. Expected a plain object.'
        );
    });

    it('should throw an error if configuration is not an object', () => {
        expect(() => validateCertConfig('invalid')).toThrow(
            'Invalid certificate configuration. Expected a plain object.'
        );
    });
});

describe('Edge cases for certificate config values', () => {
    it('should throw an error if sslKey is an empty string', () => {
        expect(() => validateCertConfig({ sslKey: '', sslCert: '/path/to/sslCert' })).toThrow(
            'Configuration errors: sslKey is required'
        );
    });

    it('should throw an error if sslCert is an empty string', () => {
        expect(() => validateCertConfig({ sslKey: '/path/to/sslKey', sslCert: '' })).toThrow(
            'Configuration errors: sslCert is required'
        );
    });

    it('should throw a combined error if both sslKey and sslCert are empty', () => {
        expect(() => validateCertConfig({ sslKey: '', sslCert: '' })).toThrow(
            'Configuration errors: sslKey is required; sslCert is required'
        );
    });

    it('should throw an error if extra keys are provided along with valid keys', () => {
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

    it('should correctly validate sandbox environment subject', async () => {
        await testCertValidation(sandboxCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents({ sslCert: 'dummy content', sslKey: 'dummy key' }, 'sandbox');
            }).not.toThrow();
        });
    });

    it('should correctly validate production environment subject', async () => {
        await testCertValidation(productionCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents(
                    { sslCert: 'dummy content', sslKey: 'dummy key' },
                    'production'
                );
            }).not.toThrow();
        });
    });

    it('should throw error for unknown environment', async () => {
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

    it('should validate certificate with matching subject for sandbox', async () => {
        await testCertValidation(sandboxCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents({ sslCert: 'dummy content', sslKey: 'dummy key' }, 'sandbox');
            }).not.toThrow();
        });
    });

    it('should validate certificate with matching subject for production', async () => {
        await testCertValidation(productionCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents(
                    { sslCert: 'dummy content', sslKey: 'dummy key' },
                    'production'
                );
            }).not.toThrow();
        });
    });

    it('should throw when certificate subject does not match expected', async () => {
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

    it('should throw when private key does not match certificate', async () => {
        await testCertValidation(keyMismatchCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents({ sslCert: 'dummy content', sslKey: 'dummy key' }, 'sandbox');
            }).toThrow(
                "Invalid certificate or key content: Private key does not match the certificate's public key."
            );
        });
    });

    it('should throw when certificate instantiation fails', async () => {
        await testCertValidation(invalidCertCryptoMock, (validateCertContents) => {
            expect(() => {
                validateCertContents(
                    { sslCert: 'invalid content', sslKey: 'dummy key' },
                    'sandbox'
                );
            }).toThrow('Invalid certificate or key content: Invalid certificate format');
        });
    });

    it('should throw with unknown environment', async () => {
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
