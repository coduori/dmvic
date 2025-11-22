import { jest } from '@jest/globals';

import { mockApiConfig } from '../mocks/mocks.mjs';

const mockMakeAuthenticatedRequest = jest.fn();

jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => mockApiConfig);
jest.unstable_mockModule('../../lib/utils/api-helpers.mjs', () => ({
    makeAuthenticatedRequest: mockMakeAuthenticatedRequest,
}));

const { verifyInsuranceCertificate } = await import(
    '../../lib/api/verify-insurance-certificate.mjs'
);

describe('check vehicle insurance validity', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it.each([
        {
            chassisNumber: 'C1864903',
            vehicleRegistration: 'KAA121A',
        },
        { chassisNumber: 'AT211-7689809' },
        {
            vehicleRegistration: 'KAA121A',
        },
    ])('should throw if no certificate number is provided: %s', async (payload) => {
        await expect(verifyInsuranceCertificate('token123', payload)).rejects.toThrow(
            'Certificate number is required!'
        );
    });

    it('should throw if neither vehicle registration or engine number is provided', async () => {
        await expect(
            verifyInsuranceCertificate('token123', { certificateNumber: 'C1864903' })
        ).rejects.toThrow('Either vehicle registration or chassis number must be provided!');
    });

    it.each([
        {
            chassisNumber: 'C1864903',
            vehicleRegistration: 'KAA121A',
            certificateNumber: 'C1864903',
        },
        {
            chassisNumber: 'AT211-7689809',
            certificateNumber: 'C1864903',
        },
        {
            vehicleRegistration: 'KAA121A',
            certificateNumber: 'C1864903',
        },
    ])('should throw if makeAuthenticatedRequest() throws: %s', async (payload) => {
        mockMakeAuthenticatedRequest.mockRejectedValueOnce(() => {
            throw new Error('network error!');
        });
        await expect(verifyInsuranceCertificate('token123', payload)).rejects.toThrow(
            /network error!/
        );
        expect(mockMakeAuthenticatedRequest).toHaveBeenCalledTimes(1);
    });

    it.each([
        {
            chassisNumber: 'C1864903',
            vehicleRegistration: 'KAA121A',
            certificateNumber: 'C1864903',
        },
        {
            chassisNumber: 'AT211-7689809',
            certificateNumber: 'C1864903',
        },
        {
            vehicleRegistration: 'KAA121A',
            certificateNumber: 'C1864903',
        },
    ])('should successfully call makeAuthenticatedRequest() with payload: %s', (payload) => {
        expect(() => verifyInsuranceCertificate('token123', payload)).not.toThrow(
            'Error fetching data: Network error'
        );
    });
});
