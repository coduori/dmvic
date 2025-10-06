import { jest } from '@jest/globals';

import { CANCELLATION_REASONS } from '../../lib/utils/cancellation-reasons.mjs';
import { cryptoPickOne } from '../random-pick.mjs';

const mockMakeAuthenticatedRequest = jest.fn();
const mockValidateSupportedValues = jest.fn();

jest.unstable_mockModule('../../lib/utils/api-helpers.mjs', () => ({
    makeAuthenticatedRequest: mockMakeAuthenticatedRequest,
    validateSupportedValues: mockValidateSupportedValues,
}));

const { cancelCertificate } = await import('../../lib/api/cancel-certificate.mjs');

describe('Cancel certificate issuance', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should call validateSupportedValues', async () => {
        const cancellationReason = cryptoPickOne(Object.keys(CANCELLATION_REASONS));
        await cancelCertificate('token123', 'C27384993', cancellationReason);

        expect(mockValidateSupportedValues).toHaveBeenCalledTimes(1);
        expect(mockValidateSupportedValues).toHaveBeenCalledWith(
            cancellationReason,
            Object.keys(CANCELLATION_REASONS),
            'cancellation reason'
        );
    });

    it('should throw if validateSupportedValues throws', async () => {
        const cancellationReason = cryptoPickOne(Object.keys(CANCELLATION_REASONS));

        const rejectedError = new Error('unsuppored value detected!');
        mockValidateSupportedValues.mockImplementationOnce(() => {
            throw rejectedError;
        });

        await expect(() =>
            cancelCertificate('token123', 'C27384993', cancellationReason)
        ).rejects.toThrow(rejectedError);
    });

    it('should call makeAuthenticatedRequest', async () => {
        const cancellationReason = cryptoPickOne(Object.keys(CANCELLATION_REASONS));

        await cancelCertificate('token123', 'C27384993', cancellationReason);

        expect(mockMakeAuthenticatedRequest).toHaveBeenCalledTimes(1);
        expect(mockMakeAuthenticatedRequest).toHaveBeenCalledWith(
            '/api/v5/Integration/CancelCertificate',
            {
                CertificateNumber: 'C27384993',
                cancelreasonid: CANCELLATION_REASONS[cancellationReason],
            },
            'token123'
        );
    });

    it('should throw if makeAuthenticatedRequest throws', async () => {
        mockMakeAuthenticatedRequest.mockImplementationOnce(() => {
            throw new Error('Network error');
        });
        const cancellationReason = cryptoPickOne(Object.keys(CANCELLATION_REASONS));

        await expect(cancelCertificate('token123', 'CERT123', cancellationReason)).rejects.toThrow(
            /Certificate Cancellation Failed/
        );
    });
});
