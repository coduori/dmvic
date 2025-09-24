import { jest } from '@jest/globals';
import Chance from 'chance';

import { getCertificateRequestPayload } from '../fixtures/certificate-request-payload.mjs';
import { INSURERS } from '../../lib/utils/insurers.mjs';
import {
    CLASS_A_CERTIFICATE_TYPE_OPTIONS,
    CLASS_D_CERTIFICATE_TYPE_OPTIONS,
    COVER_TYPE_OPTIONS,
    VEHICLE_TYPE_OPTIONS,
} from '../../lib/utils/constants.mjs';
import { getClassBCertificateRequestPayload } from '../fixtures/class-b-certificate-request-payload.mjs';
import { getClassACertificateRequestPayload } from '../fixtures/class-a-certificate-request-payload.mjs';
import { getClassDCertificateRequestPayload } from '../fixtures/class-d-certificate-request-payload.mjs';

const mockGetSecret = jest.fn();
jest.unstable_mockModule('../../lib/utils/secrets-handler.mjs', () => ({
    getSecret: mockGetSecret,
}));

const { generateInsurancePayload } = await import('../../lib/utils/generate-insurance-payload.mjs');

const chance = new Chance();

describe('generate insurance payload', () => {
    beforeEach(() => {
        mockGetSecret.mockReturnValue(true);
    });

    it('should generate a payload free of nullish values', () => {
        const payload = getCertificateRequestPayload();
        payload.nullish1 = 0;
        payload.nullish2 = null;
        payload.nullish3 = undefined;
        payload.nullish4 = '';
        payload.nullish5 = ' ';
        payload.nullish6 = false;
        payload.nullish7 = NaN;

        expect(payload).toHaveProperty('nullish1');
        expect(payload).toHaveProperty('nullish2');
        expect(payload).toHaveProperty('nullish3');
        expect(payload).toHaveProperty('nullish4');
        expect(payload).toHaveProperty('nullish5');
        expect(payload).toHaveProperty('nullish6');
        expect(payload).toHaveProperty('nullish7');

        const generatedPayload = generateInsurancePayload(payload);

        expect(generatedPayload).not.toHaveProperty('nullish1');
        expect(generatedPayload).not.toHaveProperty('nullish2');
        expect(generatedPayload).not.toHaveProperty('nullish3');
        expect(generatedPayload).not.toHaveProperty('nullish4');
        expect(generatedPayload).not.toHaveProperty('nullish5');
        expect(generatedPayload).not.toHaveProperty('nullish6');
        expect(generatedPayload).not.toHaveProperty('nullish7');
    });

    it('should transform commencing and expiring date formats to en-GB', () => {
        const payload = getCertificateRequestPayload();
        const { commencingDate, expiringDate } = payload;
        const formattedCommecingDate = new Date(commencingDate).toLocaleDateString('en-GB');
        const formattedExpiringDate = new Date(expiringDate).toLocaleDateString('en-GB');

        expect(payload).toHaveProperty('commencingDate');
        expect(payload).toHaveProperty('expiringDate');

        const generatedPayload = generateInsurancePayload(payload);

        expect(generatedPayload).toHaveProperty('Commencingdate');
        expect(generatedPayload.Commencingdate).toBe(formattedCommecingDate);
        expect(generatedPayload).toHaveProperty('Expiringdate');
        expect(generatedPayload.Expiringdate).toBe(formattedExpiringDate);
    });

    it('should throw an error when standardizeDateFormat throws', () => {
        const payload = getCertificateRequestPayload();
        payload.commencingDate = 'invalid-date-format';

        expect(() => generateInsurancePayload(payload)).toThrow();
    });
    describe('data transformation', () => {
        it.each(Object.keys(INSURERS))(
            'should transform MemberCompanyId from string to number: %s',
            (insurer) => {
                const payload = getCertificateRequestPayload({ insurer });
                const memberCompanyId = INSURERS[payload.insurer];

                const generatedPayload = generateInsurancePayload(payload);

                expect(generatedPayload).toHaveProperty('Membercompanyid');
                expect(generatedPayload.Membercompanyid).toBe(memberCompanyId);
            }
        );

        it.each(Object.keys(COVER_TYPE_OPTIONS))(
            'should transform TypeOfCover from string to number: %s',
            (coverType) => {
                const payload = getCertificateRequestPayload({ coverType });
                const selectedCoverType = COVER_TYPE_OPTIONS[coverType];

                const generatedPayload = generateInsurancePayload(payload);

                expect(generatedPayload).toHaveProperty('Typeofcover');
                expect(generatedPayload.Typeofcover).toBe(selectedCoverType);
            }
        );

        it.each(Object.keys(VEHICLE_TYPE_OPTIONS))(
            'should transform VehicleType from string to number: %s',
            (vehicleType) => {
                const payload = getClassBCertificateRequestPayload({ vehicleType });
                const selectedVehicleType = VEHICLE_TYPE_OPTIONS[vehicleType];

                const generatedPayload = generateInsurancePayload(payload);

                expect(generatedPayload).toHaveProperty('VehicleType');
                expect(generatedPayload.VehicleType).toBe(selectedVehicleType);
            }
        );

        it.each(Object.keys(CLASS_A_CERTIFICATE_TYPE_OPTIONS))(
            'should transform class A TypeOfCertificate from string to number: %s',
            (certificateType) => {
                const payload = getClassACertificateRequestPayload({ certificateType });
                const selectedCertificateType = CLASS_A_CERTIFICATE_TYPE_OPTIONS[certificateType];

                const generatedPayload = generateInsurancePayload(payload);

                expect(generatedPayload).toHaveProperty('TypeOfCertificate');
                expect(generatedPayload.TypeOfCertificate).toBe(selectedCertificateType);
            }
        );

        it.each(Object.keys(CLASS_D_CERTIFICATE_TYPE_OPTIONS))(
            'should transform class D TypeOfCertificate from string to number: %s',
            (certificateType) => {
                const payload = getClassDCertificateRequestPayload({ certificateType });
                const selectedCertificateType = CLASS_D_CERTIFICATE_TYPE_OPTIONS[certificateType];

                const generatedPayload = generateInsurancePayload(payload);

                expect(generatedPayload).toHaveProperty('TypeOfCertificate');
                expect(generatedPayload.TypeOfCertificate).toBe(selectedCertificateType);
            }
        );
    });

    describe('secret retrieval', () => {
        it('should call getSecret once', () => {
            const payload = getCertificateRequestPayload();
            generateInsurancePayload(payload);

            expect(mockGetSecret).toHaveBeenCalledTimes(1);
            expect(mockGetSecret).toHaveBeenCalledWith('includeoptionaldata');
        });

        it('should throw an error when getSecret throws', () => {
            const mockGetSecretError = 'secret includeoptionaldata is not configured';
            mockGetSecret.mockImplementationOnce(() => {
                throw new Error(mockGetSecretError);
            });
            const payload = getCertificateRequestPayload();

            expect(() => generateInsurancePayload(payload)).toThrow(mockGetSecretError);
        });
    });

    describe('optional data handling', () => {
        it('should add optional data properties to returned value when includeOptionalData is true', () => {
            const payload = getCertificateRequestPayload();
            payload.policyHolderKRAPIN = 'A010234788H';
            payload.policyHolderHudumaNumber = 'HUDUMANUMBER';
            payload.vehicleBodyType = 'SEDAN';

            const generatedPayload = generateInsurancePayload(payload);

            expect(generatedPayload).toHaveProperty('HudumaNumber');
            expect(generatedPayload).toHaveProperty('Yearofmanufacture');
            expect(generatedPayload).toHaveProperty('InsuredPIN');
            expect(generatedPayload).toHaveProperty('Vehiclemake');
            expect(generatedPayload).toHaveProperty('Vehiclemodel');
            expect(generatedPayload).toHaveProperty('Bodytype');
        });

        it('should not return nullish values for optional data', () => {
            const payload = getCertificateRequestPayload();
            payload.policyHolderKRAPIN = undefined;
            payload.policyHolderHudumaNumber = null;
            payload.vehicleBodyType = undefined;

            const generatedPayload = generateInsurancePayload(payload);

            expect(generatedPayload).not.toHaveProperty('HudumaNumber');
            expect(generatedPayload).toHaveProperty('Yearofmanufacture');
            expect(generatedPayload).not.toHaveProperty('InsuredPIN');
            expect(generatedPayload).toHaveProperty('Vehiclemake');
            expect(generatedPayload).toHaveProperty('Vehiclemodel');
            expect(generatedPayload).not.toHaveProperty('Bodytype');
        });

        it('should omit optional data properties from the returned value when includeOptionalData is false', () => {
            mockGetSecret.mockReturnValueOnce(false);
            const payload = getCertificateRequestPayload();
            payload.policyHolderKRAPIN = 'A010234788H';
            payload.policyHolderHudumaNumber = 'HUDUMANUMBER';
            payload.vehicleBodyType = 'SEDAN';

            const generatedPayload = generateInsurancePayload(payload);

            expect(generatedPayload).not.toHaveProperty('HudumaNumber');
            expect(generatedPayload).not.toHaveProperty('Yearofmanufacture');
            expect(generatedPayload).not.toHaveProperty('InsuredPIN');
            expect(generatedPayload).not.toHaveProperty('Vehiclemake');
            expect(generatedPayload).not.toHaveProperty('Vehiclemodel');
            expect(generatedPayload).not.toHaveProperty('Bodytype');
        });
    });

    describe('data preservation and structure', () => {
        it('should preserve non-transformed fields', () => {
            const payload = getCertificateRequestPayload();
            const generatedPayload = generateInsurancePayload(payload);

            expect(generatedPayload.Policyholder).toBe(payload.policyHolderFullName);
            expect(generatedPayload.policynumber).toBe(payload.policyNumber);
            expect(generatedPayload.Email).toBe(payload.recipientEmail);
            expect(generatedPayload.Chassisnumber).toBe(payload.vehicleChassisNumber);
            expect(generatedPayload.Phonenumber).toBe(payload.recipientPhoneNumber);
            expect(generatedPayload.Registrationnumber).toBe(payload.vehicleRegistrationNumber);

            if (payload.vehicleTonnage) {
                expect(generatedPayload.Tonnage).toBe(payload.vehicleTonnage);
            }

            if (payload.vehicleValue) {
                expect(generatedPayload.SumInsured).toBe(payload.vehicleValue);
            }
        });

        it('should preserve engine number if it is provided', () => {
            const payload = getCertificateRequestPayload();
            payload.vehicleEngineNumber = 'ENGINE-12-NUMBER';
            delete payload.vehicleRegistrationNumber;
            const generatedPayload = generateInsurancePayload(payload);

            expect(generatedPayload.Enginenumber).toBe(payload.vehicleEngineNumber);
        });

        it('should return object with correct structure', () => {
            const withOptionalData = chance.bool();
            mockGetSecret.mockReturnValueOnce(withOptionalData);

            const payload = getCertificateRequestPayload();
            payload.policyHolderHudumaNumber = 'HUDUMANUMBER';
            payload.vehicleYearOfManufacture = 2024;
            payload.policyHolderKRAPIN = 'A111222343J';
            payload.vehicleMake = 'TOYOTA';
            payload.vehicleModel = '110';
            payload.vehicleBodyType = 'SEDAN';

            const generatedPayload = generateInsurancePayload(payload);

            expect(generatedPayload).toHaveProperty('Membercompanyid');
            expect(generatedPayload).toHaveProperty('Typeofcover');
            expect(generatedPayload).toHaveProperty('Policyholder');
            expect(generatedPayload).toHaveProperty('policynumber');
            expect(generatedPayload).toHaveProperty('Commencingdate');
            expect(generatedPayload).toHaveProperty('Expiringdate');
            expect(generatedPayload).toHaveProperty('Email');
            expect(generatedPayload).toHaveProperty('Chassisnumber');
            expect(generatedPayload).toHaveProperty('Phonenumber');
            expect(generatedPayload).toHaveProperty('Registrationnumber');

            if (payload.vehicleType) {
                expect(generatedPayload).toHaveProperty('VehicleType');
            } else {
                expect(generatedPayload).not.toHaveProperty('VehicleType');
            }
            if (payload.certificateType) {
                expect(generatedPayload).toHaveProperty('TypeOfCertificate');
            } else {
                expect(generatedPayload).not.toHaveProperty('TypeOfCertificate');
            }
            if (payload.vehicleTonnage) {
                expect(generatedPayload).toHaveProperty('Tonnage');
            } else {
                expect(generatedPayload).not.toHaveProperty('Tonnage');
            }

            if (payload.vehicleValue) {
                expect(generatedPayload).toHaveProperty('SumInsured');
            } else {
                expect(generatedPayload).not.toHaveProperty('SumInsured');
            }

            if (withOptionalData) {
                expect(generatedPayload).toHaveProperty('HudumaNumber');
                expect(generatedPayload).toHaveProperty('Yearofmanufacture');
                expect(generatedPayload).toHaveProperty('InsuredPIN');
                expect(generatedPayload).toHaveProperty('Vehiclemake');
                expect(generatedPayload).toHaveProperty('Vehiclemodel');
                expect(generatedPayload).toHaveProperty('Bodytype');
            } else {
                expect(generatedPayload).not.toHaveProperty('HudumaNumber');
                expect(generatedPayload).not.toHaveProperty('Yearofmanufacture');
                expect(generatedPayload).not.toHaveProperty('InsuredPIN');
                expect(generatedPayload).not.toHaveProperty('Vehiclemake');
                expect(generatedPayload).not.toHaveProperty('Vehiclemodel');
                expect(generatedPayload).not.toHaveProperty('Bodytype');
            }
        });
    });
});
