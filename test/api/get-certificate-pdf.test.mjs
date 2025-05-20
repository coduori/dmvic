import { expect, jest } from '@jest/globals';

import {
    mockApiConfig,
    mockInvoke,
    mockRequestHandler,
    mockGetSecret,
    mockSecretsManager,
} from '../mocks/mocks.mjs';

const mockGetAPIBaseURL = mockApiConfig.getAPIBaseURL;

jest.unstable_mockModule('../../lib/utils/request-handler.mjs', () => mockRequestHandler);
jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => mockApiConfig);
jest.unstable_mockModule('../../lib/utils/secrets-manager.mjs', () => mockSecretsManager);

const { getCertificatePdf } = await import('../../lib/api/get-certificate-pdf.mjs');

describe('getCertificatePdf', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw if no authToken is provided', async () => {
        await expect(getCertificatePdf(null, 'CERT123')).rejects.toThrow('Authentication token is required!');
    });

    it('should call invoke with correct arguments and returns response', async () => {
        mockInvoke.mockResolvedValue({ pdf: 'mocked-pdf-data' });
        const result = await getCertificatePdf('token123', 'CERT123');
        expect(mockGetSecret).toHaveBeenCalledWith('environment');
        expect(mockGetAPIBaseURL).toHaveBeenCalledWith('test');
        expect(mockInvoke).toHaveBeenCalledTimes(1);
        expect(mockInvoke).toHaveBeenCalledWith(
            'POST',
            'https://test-api.example.com/api/t5/Integration/GetCertificate',
            { CertificateNumber: 'CERT123' },
            'token123',
        );
        expect(result).toEqual({ pdf: 'mocked-pdf-data' });
    });

    it('should throw with correct message if invoke throws', async () => {
        mockInvoke.mockRejectedValue(new Error('Network error'));
        await expect(getCertificatePdf('token123', 'CERT123')).rejects.toThrow('Error fetching data: Network error');
    });
});
