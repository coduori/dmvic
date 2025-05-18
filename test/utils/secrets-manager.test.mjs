import { jest } from '@jest/globals';

import { configureSecrets, getSecret } from '../../lib/utils/secrets-manager.mjs';
import { cleanUpEnv, mockSetConfigurationProperty } from '../mocks/mocks.mjs';

const envVariables = [
    'dmvic_username',
    'dmvic_password',
    'dmvic_clientId',
    'dmvic_environment',
];

describe('Configure DMVIC Secrets', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanUpEnv(envVariables);
    });

    it('should throw an error for missing secrets configurations', () => {
        expect(() => configureSecrets({})).toThrow('Missing required key: "username" in secrets configuration.');
        expect(() => configureSecrets({ username: 'test-user-name' })).toThrow('Missing required key: "password" in secrets configuration.');
        expect(() => configureSecrets({
            username: 'test-user-name',
            password: 'test-password',
        })).toThrow('Missing required key: "clientId" in secrets configuration.');
        expect(() => configureSecrets({
            username: 'test-user-name',
            password: 'test-password',
            clientId: 'test-clientId',
        })).toThrow('Missing required key: "environment" in secrets configuration.');
    });

    it('should persist valid secrets configuration', () => {
        expect(() => configureSecrets({
            username: 'test-user-name',
            password: 'test-password',
            clientId: 'test-clientId',
            environment: 'test-environment',
        })).not.toThrow();
    });
});

describe('Get Configured Secrets', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanUpEnv(envVariables);
    });

    it('should throw an error if username secret configuration is not set', () => {
        expect(() => getSecret('username')).toThrow('Secret "username" is not configured.');
    });

    it('should return configured DMVIC username value', () => {
        // when
        const configurationValue = 'test-user-name';
        mockSetConfigurationProperty('secrets', 'username', configurationValue);

        // then
        expect(() => getSecret('username')).not.toThrow();
        expect(getSecret('username')).toBe(configurationValue);
    });

    it('should return configured DMVIC password value', () => {
        // when
        const configurationValue = 'test-password';
        mockSetConfigurationProperty('secrets', 'password', configurationValue);

        // then
        expect(() => getSecret('password')).not.toThrow();
        expect(getSecret('password')).toBe(configurationValue);
    });

    it('should return configured DMVIC clientId value', () => {
        // when
        const configurationValue = 'someRandomClientId234';
        mockSetConfigurationProperty('secrets', 'clientId', configurationValue);

        // then
        expect(() => getSecret('clientId')).not.toThrow();
        expect(getSecret('clientId')).toBe(configurationValue);
    });

    it('should return configured DMVIC environment value', () => {
        // when
        const configurationValue = 'staging';
        mockSetConfigurationProperty('secrets', 'environment', configurationValue);

        // then
        expect(() => getSecret('environment')).not.toThrow();
        expect(getSecret('environment')).toBe(configurationValue);
    });
});
