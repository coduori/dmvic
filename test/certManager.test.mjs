/* eslint-env jest */

import { describe, expect, jest } from '@jest/globals';

import { configureCertificatePath, getCertificate } from '../src/certManager.mjs';
import { cleanUpEnv, mockSetConfigurationProperty } from './utils.mjs';

jest.mock('fs');

describe('Configure DMVIC Certificates', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanUpEnv(['DMVIC_sslKey', 'DMVIC_sslCert']);
    });

    it('should throw an error for missing certificate configurations', () => {
        expect(() => configureCertificatePath({})).toThrow('Missing required key: "sslKey" in certificate configuration.');

        expect(() => configureCertificatePath({
            sslKey: '/path/to/test/sslKey',
        })).toThrow('Missing required key: "sslCert" in certificate configuration.');

        expect(() => configureCertificatePath({
            sslCert: '/path/to/test/sslCert',
        })).toThrow('Missing required key: "sslKey" in certificate configuration.');
    });

    it('should persist valid configuration', async () => {
        expect(() => configureCertificatePath({
            sslKey: '/path/to/test/sslKey',
            sslCert: '/path/to/test/sslCert',
        })).not.toThrow();
    });
});

describe('Get Configured Certificates', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        cleanUpEnv(['DMVIC_sslKey', 'DMVIC_sslCert']);
    });

    it('should throw an error if sslKey certificate configuration is not set', () => {
        expect(() => getCertificate('sslKey')).toThrow('Certificate "sslKey" is not configured.');
    });

    it('should return sslKey certificate configuration value', () => {
        // when
        mockSetConfigurationProperty('certificate', 'sslKey');

        // then
        expect(() => getCertificate('sslKey')).not.toThrow('Certificate "sslKey" is not configured.');
        expect(getCertificate('sslKey')).toBe('/path/to/test/sslKey');
    });
});
