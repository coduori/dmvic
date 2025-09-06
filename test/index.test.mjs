


const { 
    authenticate, 
    initialize, 
    getCertificatePdf,
    checkStockStatus,
    cancelCertificate,
    checkInsuranceStatus,
    verifyInsuranceCertificate
} = await import('../lib/index.mjs');

describe('index.mjs exports', () => {
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

    it('should export checkStockStatus', () => {
        expect(checkStockStatus).toBeDefined();
        expect(typeof checkStockStatus).toBe('function');
    });

    it('should export cancelCertificate', () => {
        expect(cancelCertificate).toBeDefined();
        expect(typeof cancelCertificate).toBe('function');
    });

    it('should export checkInsuranceStatus', () => {
        expect(checkInsuranceStatus).toBeDefined();
        expect(typeof checkInsuranceStatus).toBe('function');
    });

    it('should export verifyInsuranceCertificate', () => {
        expect(verifyInsuranceCertificate).toBeDefined();
        expect(typeof verifyInsuranceCertificate).toBe('function');
    });
});
