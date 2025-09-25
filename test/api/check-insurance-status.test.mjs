import { expect, jest } from '@jest/globals';

import {
    mockApiConfig,
    mockInvoke,
    mockRequestHandler,
    mockSecretsHandler,
} from '../mocks/mocks.mjs';
import { getDateToday, getAnnualExpiry } from '../../lib/utils/standard-date-format.mjs';

jest.unstable_mockModule('../../lib/utils/request-handler.mjs', () => mockRequestHandler);
jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => mockApiConfig);
jest.unstable_mockModule('../../lib/utils/secrets-handler.mjs', () => mockSecretsHandler);

const { checkInsuranceStatus } = await import('../../lib/api/check-insurance-status.mjs');

describe('check vehicle insurance status', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw if no authToken is provided', async () => {
        await expect(checkInsuranceStatus(null, 'CERT123')).rejects.toThrow(
            'Authentication token is required!'
        );
    });

    [
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
    ].forEach((payload) => {
        it('should call invoke with correct arguments and returns response', async () => {
            mockInvoke.mockResolvedValue({
                Inputs: '',
                callbackObj: {
                    DoubleInsurance: [
                        {
                            CoverEndDate: '22/02/2026',
                            InsuranceCertificateNo: 'C31309021',
                            MemberCompanyName: 'Test Insurance Company Ltd.',
                            InsurancePolicyNo: 'G/HQ/0700/019729',
                            vehicleregistrationnumber: payload.registrationNumber
                                ? payload.registrationNumber
                                : undefined,
                            chassisnumber: payload.chassisNumber
                                ? payload.chassisNumber
                                : undefined,
                            MemberCompanyID: 44,
                            CertificateStatus: 'Active',
                        },
                    ],
                },
                success: true,
                Error: [],
                APIRequestNumber: 'OA-YZ9058',
                DMVICRefNo: null,
            });
            const result = await checkInsuranceStatus('token123', payload);
            expect(mockInvoke).toHaveBeenCalledTimes(1);
            expect(mockInvoke).toHaveBeenCalledWith(
                'POST',
                'https://test-api.example.com/api/t5/Integration/ValidateDoubleInsurance',
                {
                    vehicleregistrationnumber: payload.registrationNumber,
                    chassisnumber: payload.chassisNumber,
                    policystartdate: getDateToday(),
                    policyenddate: getAnnualExpiry(),
                },
                'token123'
            );
            expect(result).toEqual({
                Inputs: '',
                callbackObj: {
                    DoubleInsurance: [
                        {
                            CoverEndDate: '22/02/2026',
                            InsuranceCertificateNo: 'C31309021',
                            MemberCompanyName: 'Test Insurance Company Ltd.',
                            InsurancePolicyNo: 'G/HQ/0700/019729',
                            vehicleregistrationnumber: payload.registrationNumber
                                ? payload.registrationNumber
                                : undefined,
                            chassisnumber: payload.chassisNumber
                                ? payload.chassisNumber
                                : undefined,
                            MemberCompanyID: 44,
                            CertificateStatus: 'Active',
                        },
                    ],
                },
                success: true,
                Error: [],
                APIRequestNumber: 'OA-YZ9058',
                DMVICRefNo: null,
            });
        });
    });

    it('should throw with correct message if correct payload is not passed', async () => {
        mockInvoke.mockRejectedValue(
            new Error('Either registration number or chassis number is required!')
        );
        await expect(checkInsuranceStatus('token123', {})).rejects.toThrow(
            'Either registration number or chassis number is required!'
        );
        await expect(checkInsuranceStatus('token123', undefined)).rejects.toThrow(
            'Either registration number or chassis number is required!'
        );
    });

    it('should throw with correct message if invoke throws', async () => {
        mockInvoke.mockRejectedValue(new Error('Network error'));
        await expect(
            checkInsuranceStatus('token123', {
                registrationNumber: 'KBJ705Y',
                chassisNumber: 'AT211-7689809',
            })
        ).rejects.toThrow('Error fetching data: Network error');
    });
});
