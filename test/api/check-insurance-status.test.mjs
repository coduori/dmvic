import { jest } from '@jest/globals';

import { apiConfig } from '../../lib/config/api-configs.mjs';
import { generateTestCredentials } from '../factories/test-credential-generator.mjs';

const testCredentials = generateTestCredentials();

const mockMakeAuthenticatedRequest = jest.fn();
const mockGetAnnualExpiry = jest.fn(() =>
    new Date(
        new Date(new Date().setFullYear(new Date().getFullYear() + 1)).setDate(
            new Date().getDate() - 1
        )
    ).toLocaleDateString('en-GB')
);
const mockGetDateToday = jest.fn(() => new Date().toLocaleDateString('en-GB'));

jest.unstable_mockModule('../../lib/utils/api-helpers.mjs', () => ({
    makeAuthenticatedRequest: mockMakeAuthenticatedRequest,
}));

jest.unstable_mockModule('../../lib/utils/standard-date-format.mjs', () => ({
    getAnnualExpiry: mockGetAnnualExpiry,
    getDateToday: mockGetDateToday,
}));

const { checkInsuranceStatus } = await import('../../lib/api/check-insurance-status.mjs');

describe('check vehicle insurance status', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('should reject if both chassisNumber and registrationNumber are missing', async () => {
        await expect(checkInsuranceStatus('valid-auth-token', {})).rejects.toThrow(
            'Either registration number or chassis number is required!'
        );
    });

    it.each([
        {
            registrationNumber: 'KBJ705Y',
        },
        {
            chassisNumber: 'AT211-7689809',
        },
        {
            chassisNumber: 'KL911-7689871',
            registrationNumber: 'KBO709P',
        },
    ])('should call makeAuthenticatedRequest with correct payload', async (testPayload) => {
        const authToken = testCredentials.password;
        await checkInsuranceStatus(authToken, testPayload);

        const payload = {
            vehicleregistrationnumber: testPayload.registrationNumber,
            chassisnumber: testPayload.chassisNumber,
            policystartdate: mockGetDateToday(),
            policyenddate: mockGetAnnualExpiry(),
        };

        expect(mockGetAnnualExpiry).toHaveBeenCalledTimes(2);
        expect(mockGetDateToday).toHaveBeenCalledTimes(2);
        expect(mockMakeAuthenticatedRequest).toHaveBeenCalledTimes(1);

        const {
            endpoint,
            requestPayload,
            authToken: tkn,
        } = mockMakeAuthenticatedRequest.mock.calls[0][0];

        expect(endpoint).toBe(apiConfig.general.validateDoubleInsurance);
        expect(tkn).toBe(authToken);
        expect(requestPayload).toStrictEqual(payload);
        expect(mockMakeAuthenticatedRequest).toHaveBeenCalledWith({
            endpoint: apiConfig.general.validateDoubleInsurance,
            requestPayload: payload,
            authToken,
        });
    });

    it('should throw if getDateToday() throws', async () => {
        mockGetDateToday.mockImplementationOnce(() => {
            throw new Error('invalid Date!');
        });
        await expect(
            checkInsuranceStatus('valid-auth-token', { registrationNumber: 'KAA121A' })
        ).rejects.toThrow('invalid Date!');
    });

    it('should throw if getAnnualExpiry() throws', async () => {
        mockGetAnnualExpiry.mockImplementationOnce(() => {
            throw new Error('invalid Date!');
        });
        await expect(
            checkInsuranceStatus('valid-auth-token', { registrationNumber: 'KAA121A' })
        ).rejects.toThrow('invalid Date!');
    });

    it('should throw if makeAuthenticatedRequest() throws', async () => {
        mockMakeAuthenticatedRequest.mockImplementationOnce(() => {
            throw new Error('network error');
        });
        await expect(
            checkInsuranceStatus('valid-auth-token', { registrationNumber: 'KAA121A' })
        ).rejects.toThrow(/network error/);
    });
});
