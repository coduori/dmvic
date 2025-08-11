import { jest } from '@jest/globals';
import {
    configureSecrets,
    getSecret,
    isPlainObject,
    validateConfig,
    getEnvKey,
} from '../../lib/utils/secrets-manager.mjs';
import { cleanUpEnv, mockSetConfigurationProperty } from '../mocks/mocks.mjs';

const envVariables = [
    'DMVIC_USERNAME',
    'DMVIC_PASSWORD',
    'DMVIC_CLIENTID',
    'DMVIC_ENVIRONMENT',
];

describe('Configure DMVIC Secrets', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanUpEnv(envVariables);
    });

    it('should throw an error for missing secrets configurations', () => {
        expect(() => configureSecrets({})).toThrowErrorMatchingInlineSnapshot(`
            "Configuration validation failed:
            - username (missing or invalid string)
            - password (missing or invalid string)
            - clientId (missing or invalid string)
            - environment (missing or invalid string)"
            `);
        expect(() => configureSecrets({ username: 'test-user-name' })).toThrowErrorMatchingInlineSnapshot(`
            "Configuration validation failed:
            - password (missing or invalid string)
            - clientId (missing or invalid string)
            - environment (missing or invalid string)"
            `);
        expect(() => configureSecrets({
            username: 'test-user-name',
            password: 'test-password',
        })).toThrowErrorMatchingInlineSnapshot(`
            "Configuration validation failed:
            - clientId (missing or invalid string)
            - environment (missing or invalid string)"
            `);
        expect(() => configureSecrets({
            username: 'test-user-name',
            password: 'test-password',
            clientId: 'test-clientId',
        })).toThrowErrorMatchingInlineSnapshot(`
            "Configuration validation failed:
            - environment (missing or invalid string)"
            `);
    });

    it('should persist valid secrets configuration', () => {
        const validConfig = {
            username: 'test-user-name',
            password: 'test-password',
            clientId: 'test-clientId',
            environment: 'test-environment',
        };

        expect(() => configureSecrets(validConfig)).not.toThrow();

        // Assert env variables were set
        expect(process.env.DMVIC_USERNAME).toBe(validConfig.username);
        expect(process.env.DMVIC_PASSWORD).toBe(validConfig.password);
        expect(process.env.DMVIC_CLIENTID).toBe(validConfig.clientId);
        expect(process.env.DMVIC_ENVIRONMENT).toBe(validConfig.environment);
    });
});

describe('Get Configured Secrets', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanUpEnv(envVariables);
    });

    it('should throw an error if secret is not configured', () => {
        expect(() => getSecret('username')).toThrow('Secret "username" is not configured');
    });

    it('should return configured DMVIC username value', () => {
        const configurationValue = 'test-user-name';
        mockSetConfigurationProperty('secrets', 'username', configurationValue);

        expect(getSecret('username')).toBe(configurationValue);
    });

    it('should return configured DMVIC password value', () => {
        const configurationValue = 'test-password';
        mockSetConfigurationProperty('secrets', 'password', configurationValue);

        expect(getSecret('password')).toBe(configurationValue);
    });

    it('should return configured DMVIC clientId value', () => {
        const configurationValue = 'someRandomClientId234';
        mockSetConfigurationProperty('secrets', 'clientId', configurationValue);

        expect(getSecret('clientId')).toBe(configurationValue);
    });

    it('should return configured DMVIC environment value', () => {
        const configurationValue = 'staging';
        mockSetConfigurationProperty('secrets', 'environment', configurationValue);

        expect(getSecret('environment')).toBe(configurationValue);
    });
});

describe('getEnvKey', () => {
    it('should generate correct env key', () => {
        expect(getEnvKey('username')).toBe('DMVIC_USERNAME');
        expect(getEnvKey('clientId')).toBe('DMVIC_CLIENTID');
    });

    it('should convert key to uppercase', () => {
        expect(getEnvKey('userName')).toBe('DMVIC_USERNAME');
    });

    it('should work with special characters', () => {
        expect(getEnvKey('api-key')).toBe('DMVIC_API-KEY');
    });

    it('should handle empty string', () => {
        expect(getEnvKey('')).toBe('DMVIC_');
    });
});

describe('isPlainObject', () => {
    it('should return true for plain objects', () => {
        expect(isPlainObject({})).toBe(true);
        expect(isPlainObject({ a: 1 })).toBe(true);
    });

    it('should return false for null or non-objects', () => {
        expect(isPlainObject(null)).toBe(false);
        expect(isPlainObject(undefined)).toBe(false);
        expect(isPlainObject(123)).toBe(false);
        expect(isPlainObject('string')).toBe(false);
        expect(isPlainObject([])).toBe(false);
        expect(isPlainObject(() => { })).toBe(false);
    });

    it('should return true for Object.create(null)', () => {
        expect(isPlainObject(Object.create(null))).toBe(true);
    });
});

describe('validateConfig', () => {
    it('should throw if config is not a plain object', () => {
        expect(() => validateConfig(null)).toThrow('Invalid configuration. Expected a plain object.');
        expect(() => validateConfig(undefined)).toThrow('Invalid configuration. Expected a plain object.');
        expect(() => validateConfig([])).toThrow('Invalid configuration. Expected a plain object.');
        expect(() => validateConfig(123)).toThrow('Invalid configuration. Expected a plain object.');
    });

    it('should throw if required keys are missing', () => {
        expect(() => validateConfig({})).toThrowErrorMatchingInlineSnapshot(`
            "Configuration validation failed:
            - username (missing or invalid string)
            - password (missing or invalid string)
            - clientId (missing or invalid string)
            - environment (missing or invalid string)"
            `);
    });

    it('should throw if required keys are empty strings', () => {
        const config = {
            username: '',
            password: 'secret',
            clientId: 'id',
            environment: 'dev',
        };
        expect(() => validateConfig(config)).toThrow(/username \(missing or invalid string\)/);

    });

    it('should throw if any value is not a string', () => {
        const config = {
            username: 'user',
            password: 'pass',
            clientId: 123,
            environment: 'dev',
        };
        expect(() => validateConfig(config)).toThrow(/clientId \(missing or invalid string\)/);
    });

    it('should throw if config contains unexpected keys', () => {
        const config = {
            username: 'user',
            password: 'pass',
            clientId: 'id',
            environment: 'dev',
            extra: 'nope',
        };
        expect(() => validateConfig(config)).toThrow(/extra \(unexpected key\)/);
    });

    it('should throw with multiple problems (missing + extra)', () => {
        const config = {
            username: '',
            clientId: 'id',
            extra: 'not-allowed',
        };
        expect(() => validateConfig(config)).toThrow(/password.*environment.*extra/s);
    });

    it('should pass for valid config', () => {
        const config = {
            username: 'user',
            password: 'pass',
            clientId: 'client',
            environment: 'dev',
        };
        expect(() => validateConfig(config)).not.toThrow();
    });

    it('should throw for multiple missing required keys', () => {
        const config = {};
        expect(() => validateConfig(config)).toThrow(
            /username.*password.*clientId.*environment/s
        );
    });
});
