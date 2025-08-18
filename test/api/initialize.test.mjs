import { jest } from '@jest/globals';

import { initialize } from '../../lib/api/initialize.mjs';

describe('initialize DMVIC Configurations', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
        await expect(
            initialize({
                secrets: {},
                certificates: {
                    sslKey: '/path/to/test/sslKey',
                    sslCert: '/path/to/test/sslCert',
                },
            })
        ).rejects.toThrow('Missing required key: "username" in secrets configuration.');
        await expect(
            initialize({
                secrets: {
                    username: 'test-user-name',
                },
                certificates: {
                    sslKey: '/path/to/test/sslKey',
                    sslCert: '/path/to/test/sslCert',
                },
            })
        ).rejects.toThrow('Missing required key: "password" in secrets configuration.');
        await expect(
            initialize({
                secrets: {
                    username: 'test-user-name',
                    password: 'test-password',
                },
                certificates: {
                    sslKey: '/path/to/test/sslKey',
                    sslCert: '/path/to/test/sslCert',
                },
            })
        ).rejects.toThrow('Missing required key: "clientId" in secrets configuration.');
        await expect(
            initialize({
                secrets: {
                    username: 'test-user-name',
                    password: 'test-password',
                    clientId: 'test-clientId',
                },
                certificates: {
                    sslKey: '/path/to/test/sslKey',
                    sslCert: '/path/to/test/sslCert',
                },
            })
        ).rejects.toThrow('Missing required key: "environment" in secrets configuration.');
    });

    it('should throw an error for missing certificate configurations', async () => {
        await expect(
            initialize({
                secrets: {
                    username: 'test-user-name',
                    password: 'test-password',
                    clientId: 'test-clientId',
                    environment: 'test-environment',
                },
                certificates: {},
            })
        ).rejects.toThrow('Missing required key: "sslKey" in certificate configuration.');

        await expect(
            initialize({
                secrets: {
                    username: 'test-user-name',
                    password: 'test-password',
                    clientId: 'test-clientId',
                    environment: 'test-environment',
                },
                certificates: {
                    sslKey: '/path/to/test/sslKey',
                },
            })
        ).rejects.toThrow('Missing required key: "sslCert" in certificate configuration.');
    });

    it('should persist valid configuration', async () => {
        await expect(
            initialize({
                secrets: {
                    username: 'test-user-name',
                    password: 'test-password',
                    clientId: 'test-clientId',
                    environment: 'test-environment',
                },
                certificates: {
                    sslKey: '/path/to/test/sslKey',
                    sslCert: '/path/to/test/sslCert',
                },
            })
        ).resolves.toBeUndefined();
    });
});
