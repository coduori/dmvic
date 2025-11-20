import { jest } from '@jest/globals';

import { apiConfig } from '../../lib/config/api-configs.mjs';

const mockMakeAuthenticatedRequest = jest.fn();

jest.unstable_mockModule('../../lib/utils/api-helpers.mjs', () => ({
    makeAuthenticatedRequest: mockMakeAuthenticatedRequest,
}));

const { getCertificatePdf } = await import('../../lib/api/get-certificate-pdf.mjs');

describe('getCertificatePdf', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should call makeAuthenticatedRequest', async () => {
        const resolvedResponse = { success: true, data: {} };
        mockMakeAuthenticatedRequest.mockResolvedValueOnce(resolvedResponse);
        const certificateNumber = 'C27384993';
        const response = await getCertificatePdf('auth-token', 'C27384993');

        expect(mockMakeAuthenticatedRequest).toHaveBeenCalledTimes(1);
        expect(mockMakeAuthenticatedRequest).toHaveBeenCalledWith(
            apiConfig.general.getCertificatePDF,
            {
                CertificateNumber: certificateNumber,
            },
            'auth-token'
        );
        expect(response).toBe(resolvedResponse);
    });

    it('should throw with correct message if makeAuthenticatedRequest() throws', async () => {
        mockMakeAuthenticatedRequest.mockImplementationOnce(() => {
            throw new Error('Network error');
        });
        await expect(getCertificatePdf('auth-token', 'C27384993')).rejects.toThrow(/Network error/);
    });
});
