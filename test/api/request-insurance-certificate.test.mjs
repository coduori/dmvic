import { jest } from '@jest/globals';

import { getCertificateRequestPayload } from '../fixtures/certificate-request-payload.mjs';

const mockValidatePayload = jest.fn();
jest.unstable_mockModule(
    '../../lib/utils/config-validation/request-certificate-validation.mjs',
    () => ({
        validatePayload: mockValidatePayload,
    })
);

const mockGenerateInsurancePayload = jest.fn();
jest.unstable_mockModule('../../lib/utils/generate-insurance-payload.mjs', () => ({
    generateInsurancePayload: mockGenerateInsurancePayload,
}));

const mockGetAPIBaseURL = jest.fn();
const mockApiConfig = {
    issuance: {
        typeA: '/api/V5/IntermediaryIntegration/IssuanceTypeACertificate',
        typeB: '/api/V5/IntermediaryIntegration/IssuanceTypeBCertificate',
        typeC: '/api/V5/IntermediaryIntegration/IssuanceTypeCCertificate',
        typeD: '/api/V5/IntermediaryIntegration/IssuanceTypeDCertificate',
    },
};
jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => ({
    getAPIBaseURL: mockGetAPIBaseURL,
    apiConfig: mockApiConfig,
}));

const mockInvoke = jest.fn();
jest.unstable_mockModule('../../lib/utils/request-handler.mjs', () => ({
    invoke: mockInvoke,
}));

const mockGetSecret = jest.fn();
jest.unstable_mockModule('../../lib/utils/secrets-handler.mjs', () => ({
    getSecret: mockGetSecret,
}));

const { requestInsuranceCertificate } = await import(
    '../../lib/api/request-insurance-certificate.mjs'
);

describe('request insurance certificate', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        mockGetAPIBaseURL.mockReturnValue('https://test-api.dmvic.com');
        mockGetSecret.mockReturnValue('test');
        mockInvoke.mockResolvedValue({ success: true, certificateId: '12345' });
        mockGenerateInsurancePayload.mockReturnValue({
            motorClass: 'test',
            coverType: 100,
        });
    });

    describe('should pass authentication token', () => {
        it('should throw an error if authentication is not provided', async () => {
            await expect(requestInsuranceCertificate()).rejects.toThrow(
                'Authentication token is required!'
            );
        });

        it('should throw error if authentication token is null', async () => {
            await expect(requestInsuranceCertificate(null)).rejects.toThrow(
                'Authentication token is required!'
            );
        });

        it('should throw error if authentication token is empty string', async () => {
            await expect(requestInsuranceCertificate('')).rejects.toThrow(
                'Authentication token is required!'
            );
        });
    });

    describe('should provide a valid motor class option', () => {
        it('should throw error if motor class is invalid', async () => {
            await expect(
                requestInsuranceCertificate('valid-token', {}, 'INVALID_CLASS')
            ).rejects.toThrow(/Invalid motor class!/);
        });
        it('should throw error if motor class is not provided', async () => {
            await expect(requestInsuranceCertificate('valid-token', {})).rejects.toThrow(
                /Invalid motor class!/
            );
        });
    });

    describe('should provide a valid payload', () => {
        it('should throw validation error when payload validation fails', async () => {
            const payload = getCertificateRequestPayload();
            const validationError = new Error('Validation failed');
            validationError.errors = ['Field is required', 'Invalid format'];

            mockValidatePayload.mockImplementation(() => {
                throw validationError;
            });

            await expect(
                requestInsuranceCertificate('valid-token', payload, payload.motorClass)
            ).rejects.toThrow('Validation failed');
            expect(mockValidatePayload).toHaveBeenCalledTimes(1);
            expect(mockValidatePayload).toHaveBeenCalledWith(payload);
        });

        it('should call getAPIBaseURL with correct parameters', async () => {
            const payload = getCertificateRequestPayload();

            await requestInsuranceCertificate('valid-token', payload, payload.motorClass);

            expect(mockGetAPIBaseURL).toHaveBeenCalledTimes(1);
            expect(mockGetAPIBaseURL).toHaveBeenCalledWith('test');
            expect(mockGetAPIBaseURL).toHaveReturnedWith('https://test-api.dmvic.com');
        });

        describe('should provide valid parameters for invoke', () => {
            it('should call invoke with correct parameters', async () => {
                const payload = getCertificateRequestPayload();
                const apiBaseUrl = 'https://test-api.dmvic.com';
                const fullUrl = `${apiBaseUrl}${mockApiConfig.issuance[`type${payload.motorClass}`]}`;

                const result = await requestInsuranceCertificate(
                    'valid-token',
                    payload,
                    payload.motorClass
                );

                expect(mockInvoke).toHaveBeenCalledTimes(1);
                expect(mockInvoke).toHaveBeenCalledWith(
                    'POST',
                    fullUrl,
                    { motorClass: 'test', coverType: 100 },
                    'valid-token'
                );
                expect(result).toEqual({ success: true, certificateId: '12345' });
            });

            it('should throw an error if invoke failed', async () => {
                const payload = getCertificateRequestPayload();
                const mockError = 'DMVIC Request error';
                mockInvoke.mockRejectedValueOnce(new Error(mockError));

                await expect(
                    requestInsuranceCertificate('valid-token', payload, payload.motorClass)
                ).rejects.toThrow(mockError);
            });
        });
    });

    describe('should provide valid parameters for generate request payload', () => {
        it('should call generateInsurancePayload with certificate request payload', async () => {
            const payload = getCertificateRequestPayload();

            await requestInsuranceCertificate('valid-token', payload, payload.motorClass);

            expect(mockGenerateInsurancePayload).toHaveBeenCalledTimes(1);
            expect(mockGenerateInsurancePayload).toHaveBeenCalledWith(payload);
        });
    });

    describe('should provide valid parameters for get secret', () => {
        it('should call getSecret with environment parameter', async () => {
            const payload = getCertificateRequestPayload();

            await requestInsuranceCertificate('valid-token', payload, payload.motorClass);

            expect(mockGetSecret).toHaveBeenCalledTimes(1);
            expect(mockGetSecret).toHaveBeenCalledWith('environment');
        });

        it('should call getSecret with correct parameters', async () => {
            const payload = getCertificateRequestPayload();

            await requestInsuranceCertificate('valid-token', payload, payload.motorClass);

            expect(mockGetSecret).toHaveBeenCalledTimes(1);
            expect(mockGetSecret).toHaveBeenCalledWith('environment');
            expect(mockGetSecret).toHaveReturnedWith('test');
        });

        it('should throw if getSecret fails', async () => {
            const payload = getCertificateRequestPayload();
            const mockSecretError = 'No secret found!';
            mockGetSecret.mockImplementationOnce(() => {
                throw new Error(mockSecretError);
            });

            await expect(
                requestInsuranceCertificate('valid-token', payload, payload.motorClass)
            ).rejects.toThrow(mockSecretError);
        });
    });

    describe('should handle all valid motor classes', () => {
        it.each(['A', 'B', 'C', 'D'])('should handle motor class %s', async (motorClass) => {
            const payload = { ...getCertificateRequestPayload({ motorClass }), motorClass };
            const expectedUrl = `https://test-api.dmvic.com${mockApiConfig.issuance[`type${motorClass}`]}`;

            await requestInsuranceCertificate('valid-token', payload, motorClass);

            expect(mockInvoke).toHaveBeenCalledWith(
                'POST',
                expectedUrl,
                { motorClass: 'test', coverType: 100 },
                'valid-token'
            );
            await expect(
                requestInsuranceCertificate('valid-token', payload, payload.motorClass)
            ).resolves.not.toThrow();
        });
    });
});
