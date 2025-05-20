import { jest } from '@jest/globals';

jest.unstable_mockModule('../lib/api/authenticate.mjs', () => ({
    authenticate: jest.fn(),
}));

jest.unstable_mockModule('../lib/api/initialize.mjs', () => ({
    initialize: jest.fn(),
}));

const { authenticate, initialize, getCertificatePdf } = await import('../lib/index.mjs');

describe('index.mjs', () => {
    it('should export authenticate', () => {
        expect(authenticate).toBeDefined();
        expect(typeof authenticate).toBe('function');
    });

    it('should export initialize', () => {
        expect(initialize).toBeDefined();
        expect(typeof initialize).toBe('function');
    });

    it('should export getCertificatePdf', () => {
        expect(getCertificatePdf).toBeDefined();
        expect(typeof getCertificatePdf).toBe('function');
    });
});
