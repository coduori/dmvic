import { jest } from '@jest/globals';

import { getCertificateRequestPayload } from '../fixtures/certificate-request-payload.mjs';
import { MOTOR_CLASS_OPTIONS } from '../../lib/utils/constants.mjs';

const mockValidateSupportedValues = jest.fn();
const mockMakeAuthenticatedRequest = jest.fn();
const mockGenerateInsurancePayload = jest.fn();
const mockValidatePayload = jest.fn();

jest.unstable_mockModule('../../lib/utils/api-helpers.mjs', () => ({
    validateSupportedValues: mockValidateSupportedValues,
    makeAuthenticatedRequest: mockMakeAuthenticatedRequest,
}));
jest.unstable_mockModule('../../lib/utils/generate-insurance-payload', () => ({
    generateInsurancePayload: mockGenerateInsurancePayload,
}));
jest.unstable_mockModule(
    '../../lib/utils/config-validation/request-certificate-validation.mjs',
    () => ({
        validatePayload: mockValidatePayload,
    })
);

const { requestInsuranceCertificate } = await import(
    '../../lib/api/request-insurance-certificate.mjs'
);

describe('request insurance certificate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
    it.each(Object.values(MOTOR_CLASS_OPTIONS))(
        'should resolve makeAuthenitcatedRequest(): class %s',
        (validMotorClass) => {
            const certificateRequestPayload = getCertificateRequestPayload({
                motorClass: validMotorClass,
            });

            expect(() =>
                requestInsuranceCertificate(
                    'valid-auth-token',
                    certificateRequestPayload,
                    validMotorClass
                )
            ).not.toThrow();
            expect(mockValidateSupportedValues).toHaveBeenCalledTimes(1);
            expect(mockValidatePayload).toHaveBeenCalledTimes(1);
            expect(mockGenerateInsurancePayload).toHaveBeenCalledTimes(1);
            expect(mockValidateSupportedValues).toHaveBeenCalledWith(
                validMotorClass,
                Object.values(MOTOR_CLASS_OPTIONS),
                'motor class'
            );
        }
    );

    it.each(Object.values(MOTOR_CLASS_OPTIONS))(
        'should throw if validateSupportedValues() throws: class %s',
        async (validMotorClass) => {
            mockValidateSupportedValues.mockImplementationOnce(() => {
                throw new Error('unsupported value!');
            });
            const certificateRequestPayload = getCertificateRequestPayload({
                motorClass: validMotorClass,
            });
            await expect(
                requestInsuranceCertificate(
                    'valid-auth-token',
                    certificateRequestPayload,
                    validMotorClass
                )
            ).rejects.toThrow(/unsupported value/);
        }
    );

    it.each(Object.values(MOTOR_CLASS_OPTIONS))(
        'should throw if validatePayload() throws: class %s ',
        async (validMotorClass) => {
            mockValidatePayload.mockImplementationOnce(() => {
                throw new Error('payload validation failed!');
            });
            const certificateRequestPayload = getCertificateRequestPayload({
                motorClass: validMotorClass,
            });

            await expect(
                requestInsuranceCertificate(
                    'valid-auth-token',
                    certificateRequestPayload,
                    validMotorClass
                )
            ).rejects.toThrow(/payload validation failed/);
            expect(mockGenerateInsurancePayload).not.toHaveBeenCalled();
            expect(mockMakeAuthenticatedRequest).not.toHaveBeenCalled();
        }
    );

    it.each(Object.values(MOTOR_CLASS_OPTIONS))(
        'should throw if validateSupportedValues() throws: class %s ',
        async (validMotorClass) => {
            mockValidateSupportedValues.mockImplementationOnce(() => {
                throw new Error('unsupported value!');
            });
            const certificateRequestPayload = getCertificateRequestPayload({
                motorClass: validMotorClass,
            });

            await expect(
                requestInsuranceCertificate(
                    'valid-auth-token',
                    certificateRequestPayload,
                    validMotorClass
                )
            ).rejects.toThrow(/unsupported value/);
            expect(mockValidatePayload).not.toHaveBeenCalled();
            expect(mockGenerateInsurancePayload).not.toHaveBeenCalled();
            expect(mockMakeAuthenticatedRequest).not.toHaveBeenCalled();
        }
    );

    it.each(Object.values(MOTOR_CLASS_OPTIONS))(
        'should throw if generateInsurancePayload() throws: class %s ',
        async (validMotorClass) => {
            mockGenerateInsurancePayload.mockImplementationOnce(() => {
                throw new Error('could not standardize date format!');
            });
            const certificateRequestPayload = getCertificateRequestPayload({
                motorClass: validMotorClass,
            });

            await expect(
                requestInsuranceCertificate(
                    'valid-auth-token',
                    certificateRequestPayload,
                    validMotorClass
                )
            ).rejects.toThrow(/Request Insurance Certificate Failed:/);
            expect(mockValidatePayload).toHaveBeenCalledTimes(1);
            expect(mockValidateSupportedValues).toHaveBeenCalledTimes(1);
            expect(mockGenerateInsurancePayload).toHaveBeenCalledTimes(1);
            expect(mockMakeAuthenticatedRequest).not.toHaveBeenCalled();
        }
    );

    it.each(Object.values(MOTOR_CLASS_OPTIONS))(
        'should throw if makeAuthenticatedRequest() throws: class %s ',
        async (validMotorClass) => {
            mockMakeAuthenticatedRequest.mockImplementationOnce(() => {
                throw new Error('network error!');
            });
            const certificateRequestPayload = getCertificateRequestPayload({
                motorClass: validMotorClass,
            });

            await expect(
                requestInsuranceCertificate(
                    'valid-auth-token',
                    certificateRequestPayload,
                    validMotorClass
                )
            ).rejects.toThrow(/Request Insurance Certificate Failed:/);
            expect(mockValidatePayload).toHaveBeenCalledTimes(1);
            expect(mockValidateSupportedValues).toHaveBeenCalledTimes(1);
            expect(mockGenerateInsurancePayload).toHaveBeenCalledTimes(1);
            expect(mockMakeAuthenticatedRequest).toHaveBeenCalledTimes(1);
        }
    );
});
