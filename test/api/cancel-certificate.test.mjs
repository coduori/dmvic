import { expect, jest } from '@jest/globals';

import {
    mockApiConfig,
    mockInvoke,
    mockRequestHandler,
    mockSecretsHandler,
} from '../mocks/mocks.mjs';

jest.unstable_mockModule('../../lib/utils/request-handler.mjs', () => mockRequestHandler);
jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => mockApiConfig);
jest.unstable_mockModule('../../lib/utils/secrets-handler.mjs', () => mockSecretsHandler);

const { cancelCertificate } = await import('../../lib/api/cancel-certificate.mjs');

describe('Cancel certificate issuance', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw if no authToken is provided', async () => {
        await expect(cancelCertificate(null, 'CERT123')).rejects.toThrow(
            'Authentication token is required!'
        );
    });

    it('should call invoke with correct arguments and returns response', async () => {
        mockInvoke.mockResolvedValue({
            responseBody: {
                Inputs: '{"certificatenumber":"C27384993","cancelreasonid":18}',
                callbackObj: { TransactionReferenceNumber: 'UAT-XAA0552' },
                success: true,
                Error: [],
                APIRequestNumber: 'UAT-OIC7618',
                DMVICRefNo: null,
            },
            statusCode: 200,
        });
        const result = await cancelCertificate('token123', 'C27384993', 18);
        expect(mockInvoke).toHaveBeenCalledTimes(1);
        expect(mockInvoke).toHaveBeenCalledWith(
            'POST',
            'https://test-api.example.com/api/t5/Integration/CancelCertificate',
            { CertificateNumber: 'C27384993', cancelreasonid: 18 },
            'token123'
        );
        expect(result).toEqual({
            responseBody: {
                Inputs: '{"certificatenumber":"C27384993","cancelreasonid":18}',
                callbackObj: { TransactionReferenceNumber: 'UAT-XAA0552' },
                success: true,
                Error: [],
                APIRequestNumber: 'UAT-OIC7618',
                DMVICRefNo: null,
            },
            statusCode: 200,
        });
    });

    it('should throw with correct message if invoke throws', async () => {
        mockInvoke.mockRejectedValue(new Error('Network error'));
        await expect(cancelCertificate('token123', 'CERT123')).rejects.toThrow(
            'Error fetching data: Network error'
        );
    });
});
