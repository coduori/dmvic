import { expect, jest } from '@jest/globals';

import {
    mockApiConfig,
    mockInvoke,
    mockRequestHandler,
    mockSecretsManager,
} from '../mocks/mocks.mjs';

jest.unstable_mockModule('../../lib/utils/request-handler.mjs', () => mockRequestHandler);
jest.unstable_mockModule('../../lib/config/api-configs.mjs', () => mockApiConfig);
jest.unstable_mockModule('../../lib/utils/secrets-manager.mjs', () => mockSecretsManager);

const { verifyInsuranceCertificate } = await import(
    '../../lib/api/verify-insurance-certificate.mjs'
);

describe('check vehicle insurance validity', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    [undefined, null].forEach((invalidAuthToken) => {
        it('should throw if no authToken is provided', async () => {
            await expect(verifyInsuranceCertificate(invalidAuthToken, {})).rejects.toThrow(
                'Authentication token is required!'
            );
        });
    });

    [
        {
            chassisNumber: 'C1864903',
            vehicleRegistration: 'KAA121A',
        },
        {
            chassisNumber: 'AT211-7689809',
        },
        {
            vehicleRegistration: 'KAA121A',
        },
    ].forEach((payload) => {
        it('should throw if no certificate number is provided', async () => {
            await expect(verifyInsuranceCertificate('token123', payload)).rejects.toThrow(
                'Certificate number is required!'
            );
        });
    });

    it('should throw if neither vehicle registration or chassis number is provided', async () => {
        await expect(
            verifyInsuranceCertificate('token123', { certificateNumber: 'C1864903' })
        ).rejects.toThrow('Either vehicle registration or chassis number must be provided!');
    });

    it('should throw with correct message if invoke throws', async () => {
        mockInvoke.mockRejectedValue(new Error('Network error'));
        await expect(
            verifyInsuranceCertificate('token123', {
                vehicleRegistration: 'KBJ705Y',
                chassisNumber: 'AT211-7689809',
                certificateNumber: 'C1864903',
            })
        ).rejects.toThrow('Error fetching data: Network error');
    });

    const payload = {
        vehicleRegistration: 'KBJ705Y',
        chassisNumber: 'AT211-7689809',
        certificateNumber: 'C1864903',
    };
    [
        {
            Inputs: payload,
            callbackObj: {},
            success: false,
            Error: [
                {
                    errorCode: 'ER004',
                    errorText: 'Certificate Number is not valid',
                },
            ],
            APIRequestNumber: 'UAT-OIC7618',
            DMVICRefNo: null,
        },
        {
            Inputs: {
                VehicleRegistrationnumber: 'KEL011C',
                Chassisnumber: null,
                CertificateNumber: 'C1864903',
            },
            callbackObj: {
                ValidateInsurance: {
                    CertificateNumber: 'C1864903',
                    InsurancePolicyNumber: 'MTEST32481',
                    ValidFrom: '22/07/2025 00:00',
                    ValidTill: '22/07/2025 09:50',
                    Registrationnumber: 'KBJ705Y',
                    InsuredBy: 'DEFINITE ASSURANCE CO. LTD',
                    Chassisnumber: 'AT211-7689809',
                    sInsuredName: 'Travon Beahan',
                    Intermediary: 'COMPANY INSURANCE LIMITED',
                    IntermediaryIRA: 'IRA/05/22211/2022',
                    CertificateStatus: 'Cancelled',
                    IsDigitalCertificate: true,
                    CertificateClassificationName: null,
                    CarryingCapacity: 0,
                    Tonnage: 0,
                    make: null,
                    model: null,
                },
            },
            success: true,
            Error: [],
            APIRequestNumber: 'UAT-OIC9574',
            DMVICRefNo: null,
        },
        {
            Inputs: {
                VehicleRegistrationnumber: 'KSY777Y',
                Chassisnumber: null,
                CertificateNumber: 'C1864903',
            },
            callbackObj: {
                ValidateInsurance: {
                    CertificateNumber: 'C1864903',
                    InsurancePolicyNumber: 'first_assurance/commercial/4',
                    ValidFrom: '12/07/2025 00:00',
                    ValidTill: '11/06/2026 23:59',
                    Registrationnumber: 'KBJ705Y',
                    InsuredBy: 'DEFINITE ASSURANCE CO. LTD',
                    Chassisnumber: 'AT211-7689809',
                    sInsuredName: 'JACKLINE AKOTH',
                    Intermediary: 'COMPANY INSURANCE LIMITED',
                    IntermediaryIRA: 'IRA/05/22211/2022',
                    CertificateStatus: 'Active',
                    IsDigitalCertificate: true,
                    CertificateClassificationName: null,
                    CarryingCapacity: 0,
                    Tonnage: 0,
                    make: null,
                    model: null,
                },
            },
            success: true,
            Error: [],
            APIRequestNumber: 'UAT-OIC9576',
            DMVICRefNo: null,
        },
    ].forEach((dmvicResponseBody) => {
        it('should return correct response', async () => {
            mockInvoke.mockResolvedValue({
                responseBody: dmvicResponseBody,
            });
            const result = await verifyInsuranceCertificate('token123', payload);
            expect(mockInvoke).toHaveBeenCalledTimes(1);
            expect(mockInvoke).toHaveBeenCalledWith(
                'POST',
                'https://test-api.example.com/api/t5/Integration/ValidateInsurance',
                {
                    CertificateNumber: payload.certificateNumber,
                    VehicleRegistrationnumber: payload.vehicleRegistration,
                    Chassisnumber: payload.chassisNumber,
                },
                'token123'
            );
            expect(result).toEqual({
                responseBody: dmvicResponseBody,
            });
        });
    });
});
