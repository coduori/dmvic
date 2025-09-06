import { validateSecretsConfig } from '../../../lib/utils/validation/secrets-validator.mjs';
import { generateTestCredentials } from '../../factories/test-credential-generator.mjs';

const requiredKeys = ['username', 'password', 'clientid', 'environment'];
const testCredentials = generateTestCredentials();

describe('validateSecretsConfig', () => {
    it('should not throw an error for a valid configuration', () => {
        const validConfig = {
            username: testCredentials.username,
            password: testCredentials.password,
            clientid: testCredentials.clientid,
            environment: testCredentials.environment,
        };

        expect(() => validateSecretsConfig(validConfig, requiredKeys)).not.toThrow();
    });
});

describe('Invalid Input Types', () => {
    it('should throw an error if the configuration is null', () => {
        expect(() => validateSecretsConfig(null, requiredKeys)).toThrow(
            'Invalid configuration. Expected a plain object.'
        );
    });

    it('should throw an error if the configuration is not an object', () => {
        expect(() => validateSecretsConfig('string', requiredKeys)).toThrow(
            'Invalid configuration. Expected a plain object.'
        );
        expect(() => validateSecretsConfig(123, requiredKeys)).toThrow(
            'Invalid configuration. Expected a plain object.'
        );
        expect(() => validateSecretsConfig(undefined, requiredKeys)).toThrow(
            'Invalid configuration. Expected a plain object.'
        );
    });

    it('should throw an error if the configuration is an array', () => {
        expect(() => validateSecretsConfig([], requiredKeys)).toThrow(
            'Invalid configuration. Expected a plain object.'
        );
    });
});

describe('Missing Keys', () => {
    it('should throw an error when one required key is missing', () => {
        const incompleteConfig = {
            username: testCredentials.username,
            password: testCredentials.password,
            clientid: testCredentials.clientid,
        };
        expect(() => validateSecretsConfig(incompleteConfig, requiredKeys)).toThrow(
            'Configuration errors: Missing one or more required keys: environment. Expected keys are: username, password, clientid, environment.'
        );
    });

    it('should throw an error when multiple required keys are missing', () => {
        const incompleteConfig = {
            username: testCredentials.username,
        };
        expect(() => validateSecretsConfig(incompleteConfig, requiredKeys)).toThrow(
            'Configuration errors: Missing one or more required keys: password, clientid, environment. Expected keys are: username, password, clientid, environment.'
        );
    });
});

describe('Invalid and Extra Keys', () => {
    it('should throw an error when an invalid key is provided', () => {
        const invalidConfig = {
            username: testCredentials.username,
            password: testCredentials.password,
            clientid: testCredentials.clientid,
            environment: testCredentials.environment,
            api_key: 'xyz-123',
        };
        expect(() => validateSecretsConfig(invalidConfig, requiredKeys)).toThrow(
            'Configuration errors: Found one or more invalid keys: api_key. Allowed keys are: username, password, clientid, environment.'
        );
    });
});

describe('Mixed Errors', () => {
    it('should throw an error when invalid keys are present', () => {
        const mixedConfig = {
            username: testCredentials.username,
            clientid: testCredentials.clientid,
            invalidKey: 'value',
        };
        expect(() => validateSecretsConfig(mixedConfig, requiredKeys)).toThrow(
            'Configuration errors: Found one or more invalid keys: invalidkey. Allowed keys are: username, password, clientid, environment.; Missing one or more required keys: password, environment. Expected keys are: username, password, clientid, environment.'
        );
    });
});
