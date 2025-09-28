import { expect, jest } from '@jest/globals';

import {
    mockApiConfig,
    mockInvoke,
    mockRequestHandler,
    mockSecretsHandler,
} from '../mocks/mocks.mjs';
import { cryptoPickOne } from '../random-pick.mjs';
import { CANCELLATION_REASONS } from '../../lib/utils/cancellation-reasons.mjs';

jest.unstable_mockModule('../../lib/utils/request-handler.mjs', () => mockRequestHandler);
jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => mockApiConfig);
jest.unstable_mockModule('../../lib/utils/secrets-handler.mjs', () => mockSecretsHandler);

const { cancelCertificate } = await import('../../lib/api/cancel-certificate.mjs');

describe('Cancel certificate issuance', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw if no authToken is provided', async () => {
        const cancellationReason = cryptoPickOne(Object.keys(CANCELLATION_REASONS));
        await expect(cancelCertificate(null, 'CERT123', cancellationReason)).rejects.toThrow(
            /Authentication token is required!/
        );
    });

    it.each([
        ['empty string', ''],
        ['whitespace string', ' '],
        ['invalid string', 'UNSUPPORTED_REASON'],
        ['invalid data type', true],
    ])(
        'should throw if provided reason is not supported: %s - %s',
        async (description, unsupportedReason) => {
            const errorString = `${unsupportedReason} is not a valid reason.`;
            await expect(() =>
                cancelCertificate('valid-auth-token', 'CERT123', unsupportedReason)
            ).rejects.toThrow(new RegExp('^' + errorString + '.*'));
        }
    );

    it.each(Object.keys(CANCELLATION_REASONS))(
        'should accept all valid cancellation reasons: %s',
        async (cancellationReason) => {
            expect(() =>
                cancelCertificate('token123', 'C27384993', cancellationReason)
            ).not.toThrow();
        }
    );

    it('should call invoke with correct arguments and returns response', async () => {
        const cancellationReason = cryptoPickOne(Object.keys(CANCELLATION_REASONS));

        mockInvoke.mockResolvedValue({
            responseBody: {
                Inputs: `{"certificatenumber":"C27384993","cancelreasonid":${CANCELLATION_REASONS[cancellationReason]}}`,
                callbackObj: { TransactionReferenceNumber: 'UAT-XAA0552' },
                success: true,
                Error: [],
                APIRequestNumber: 'UAT-OIC7618',
                DMVICRefNo: null,
            },
            statusCode: 200,
        });

        const result = await cancelCertificate('token123', 'C27384993', cancellationReason);
        expect(mockInvoke).toHaveBeenCalledTimes(1);

        expect(mockInvoke).toHaveBeenCalledWith(
            'POST',
            'https://test-api.example.com/api/t5/Integration/CancelCertificate',
            {
                CertificateNumber: 'C27384993',
                cancelreasonid: CANCELLATION_REASONS[cancellationReason],
            },
            'token123'
        );
        await expect(result).toEqual({
            responseBody: {
                Inputs: `{"certificatenumber":"C27384993","cancelreasonid":${CANCELLATION_REASONS[cancellationReason]}}`,
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
        const cancellationReason = cryptoPickOne(Object.keys(CANCELLATION_REASONS));

        await expect(cancelCertificate('token123', 'CERT123', cancellationReason)).rejects.toThrow(
            'Error fetching data: Network error'
        );
    });
});
